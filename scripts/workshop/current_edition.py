"""Current entry point for the supplied October 20, 28-slide edition."""
from revised_edition import build

if __name__ == "__main__":
    import argparse
    import json
    from pathlib import Path
    from revised_content import speaking_notes
    parser=argparse.ArgumentParser()
    parser.add_argument('--notes-json',type=Path,help='Export shared PowerPoint notes instead of rebuilding pages')
    args=parser.parse_args()
    if args.notes_json:
        args.notes_json.write_text(json.dumps(speaking_notes(),indent=2)+'\n')
    else:
        build()
