package main

import "testing"

func TestCloseProtectsUnsavedWorkUntilConfirmed(t *testing.T) {
	d := &Desktop{}
	if prevent, prompt := d.closeDecision(); prevent || prompt {
		t.Fatal("clean session should close directly")
	}
	d.SetUnsaved(true)
	if prevent, prompt := d.closeDecision(); !prevent || !prompt {
		t.Fatal("unsaved work must request confirmation")
	}
	// Cancelling changes no native state; subsequent requests must still ask.
	if prevent, prompt := d.closeDecision(); !prevent || !prompt {
		t.Fatal("cancel must retain the close guard")
	}
	if err := d.acceptQuit(); err != nil {
		t.Fatal(err)
	}
	d.SetUnsaved(true) // A late UI notification must not veto the accepted close.
	if prevent, prompt := d.closeDecision(); prevent || prompt {
		t.Fatal("accepted close was blocked or prompted twice")
	}
	if err := d.begin(); err == nil {
		t.Fatal("file operation started after accepted quit")
	}
}

func TestCloseCannotInterruptAFileOperation(t *testing.T) {
	d := &Desktop{dirty: true}
	if err := d.begin(); err != nil {
		t.Fatal(err)
	}
	if prevent, prompt := d.closeDecision(); !prevent || prompt {
		t.Fatal("active file operation must block close without opening a discard dialog")
	}
	if err := d.acceptQuit(); err == nil {
		t.Fatal("quit accepted during active file operation")
	}
	if d.quitAccepted {
		t.Fatal("rejected quit changed accepted state")
	}
	d.end()
	if err := d.acceptQuit(); err != nil {
		t.Fatal(err)
	}
	if prevent, _ := d.closeDecision(); prevent {
		t.Fatal("close remained blocked after operation finished")
	}
}
