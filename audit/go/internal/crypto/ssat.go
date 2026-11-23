package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"golang.org/x/crypto/argon2"
)

const (
	FormatID   = "ssat-encrypted-v1"
	Version    = 1
	KDFName    = "argon2id"
	CipherName = "aes-256-gcm"

	MinT               = 2
	MaxT               = 10
	MinM               = 16384  // 16 MiB
	MaxM               = 131072 // 128 MiB
	MinP               = 1
	MaxP               = 4
	KeyLen             = 32
	SaltLen            = 16
	NonceLen           = 12
	MinPassphraseLen   = 10
	MaxPlaintextBytes  = 10 * 1024 * 1024
	MaxEnvelopeBytes   = 14 * 1024 * 1024
)

type KdfParams struct {
	T     uint32 `json:"t"`
	M     uint32 `json:"m"`
	P     uint8  `json:"p"`
	DkLen uint32 `json:"dkLen"`
}

type Envelope struct {
	Format        string    `json:"format"`
	Version       int       `json:"version"`
	KDF           string    `json:"kdf"`
	KDFParams     KdfParams `json:"kdf_params"`
	Cipher        string    `json:"cipher"`
	SaltB64       string    `json:"salt_b64"`
	NonceB64      string    `json:"nonce_b64"`
	CiphertextB64 string    `json:"ciphertext_b64"`
}

func DefaultKDFParams() KdfParams {
	return KdfParams{
		T:     3,
		M:     32768, // 32 MiB — matches browser default
		P:     1,
		DkLen: KeyLen,
	}
}

func ValidateKDFParams(p KdfParams) error {
	if p.T < MinT || p.T > MaxT {
		return fmt.Errorf("unsupported Argon2id time cost (must be %d..%d)", MinT, MaxT)
	}
	if p.M < MinM || p.M > MaxM {
		return fmt.Errorf("unsupported Argon2id memory parameter (must be %d..%d KiB)", MinM, MaxM)
	}
	if p.P < MinP || p.P > MaxP {
		return fmt.Errorf("unsupported Argon2id parallelism parameter (must be %d..%d)", MinP, MaxP)
	}
	if p.DkLen != KeyLen {
		return errors.New("unsupported Argon2id key length")
	}
	return nil
}

// BuildCanonicalAAD constructs the exact same AAD byte sequence used by web/src/crypto/ssat.ts.
func BuildCanonicalAAD(env Envelope) []byte {
	s := fmt.Sprintf(
		"%s|v=%d|kdf=%s|t=%d|m=%d|p=%d|dkLen=%d|cipher=%s|salt=%s|nonce=%s",
		env.Format,
		env.Version,
		env.KDF,
		env.KDFParams.T,
		env.KDFParams.M,
		env.KDFParams.P,
		env.KDFParams.DkLen,
		env.Cipher,
		env.SaltB64,
		env.NonceB64,
	)
	return []byte(s)
}

func zeroBytes(b []byte) {
	for i := range b {
		b[i] = 0
	}
}

// Encrypt seals UTF-8 JSON plaintext into a versioned .ssat v1 JSON envelope.
func Encrypt(plaintext []byte, passphrase string, params KdfParams) ([]byte, error) {
	if len(passphrase) < MinPassphraseLen {
		return nil, fmt.Errorf("passphrase must be at least %d characters", MinPassphraseLen)
	}
	if err := ValidateKDFParams(params); err != nil {
		return nil, err
	}
	if len(plaintext) == 0 || len(plaintext) > MaxPlaintextBytes {
		return nil, errors.New("audit payload size out of bounds")
	}

	salt := make([]byte, SaltLen)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return nil, errors.New("failed to generate salt")
	}
	nonce := make([]byte, NonceLen)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, errors.New("failed to generate nonce")
	}

	env := Envelope{
		Format:    FormatID,
		Version:   Version,
		KDF:       KDFName,
		KDFParams: params,
		Cipher:    CipherName,
		SaltB64:   base64.StdEncoding.EncodeToString(salt),
		NonceB64:  base64.StdEncoding.EncodeToString(nonce),
	}

	key := argon2.IDKey([]byte(passphrase), salt, params.T, params.M, params.P, params.DkLen)
	defer zeroBytes(key)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, errors.New("cipher initialization failed")
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, errors.New("GCM initialization failed")
	}

	aad := BuildCanonicalAAD(env)
	ct := gcm.Seal(nil, nonce, plaintext, aad)
	env.CiphertextB64 = base64.StdEncoding.EncodeToString(ct)

	out, err := json.MarshalIndent(env, "", "  ")
	if err != nil {
		return nil, errors.New("failed to encode .ssat envelope")
	}
	return out, nil
}

// ValidateEnvelopeStructure validates header and bounds without requiring the passphrase.
func ValidateEnvelopeStructure(raw []byte) (Envelope, []byte, []byte, []byte, error) {
	var empty Envelope
	if len(raw) == 0 || len(raw) > MaxEnvelopeBytes {
		return empty, nil, nil, nil, errors.New("encrypted audit file size out of bounds")
	}
	var env Envelope
	if err := json.Unmarshal(raw, &env); err != nil {
		return empty, nil, nil, nil, errors.New("file is not a valid .ssat JSON envelope")
	}
	if env.Format != FormatID || env.Version != Version {
		return empty, nil, nil, nil, errors.New("unsupported .ssat format or version")
	}
	if env.KDF != KDFName {
		return empty, nil, nil, nil, errors.New("unsupported KDF algorithm")
	}
	if env.Cipher != CipherName {
		return empty, nil, nil, nil, errors.New("unsupported cipher")
	}
	if err := ValidateKDFParams(env.KDFParams); err != nil {
		return empty, nil, nil, nil, err
	}
	salt, err := base64.StdEncoding.DecodeString(env.SaltB64)
	if err != nil || len(salt) != SaltLen {
		return empty, nil, nil, nil, errors.New("invalid salt in .ssat file")
	}
	nonce, err := base64.StdEncoding.DecodeString(env.NonceB64)
	if err != nil || len(nonce) != NonceLen {
		return empty, nil, nil, nil, errors.New("invalid nonce in .ssat file")
	}
	ct, err := base64.StdEncoding.DecodeString(env.CiphertextB64)
	if err != nil || len(ct) < 17 {
		return empty, nil, nil, nil, errors.New("encrypted payload truncated or invalid")
	}
	return env, salt, nonce, ct, nil
}

// Decrypt verifies header AAD and decrypts a .ssat v1 bundle back into JSON plaintext.
func Decrypt(raw []byte, passphrase string) ([]byte, error) {
	if passphrase == "" {
		return nil, errors.New("passphrase is required")
	}
	env, salt, nonce, ct, err := ValidateEnvelopeStructure(raw)
	if err != nil {
		return nil, err
	}

	key := argon2.IDKey([]byte(passphrase), salt, env.KDFParams.T, env.KDFParams.M, env.KDFParams.P, env.KDFParams.DkLen)
	defer zeroBytes(key)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, errors.New("cipher initialization failed")
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, errors.New("GCM initialization failed")
	}

	aad := BuildCanonicalAAD(env)
	pt, err := gcm.Open(nil, nonce, ct, aad)
	if err != nil {
		return nil, errors.New("unable to decrypt .ssat file; check passphrase or verify file integrity")
	}
	if len(pt) > MaxPlaintextBytes {
		return nil, errors.New("decrypted payload exceeds maximum size")
	}
	return pt, nil
}
