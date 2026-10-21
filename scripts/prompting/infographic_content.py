"""Illustrated explanations share editable labels between the PPTX and webdeck."""
from pathlib import Path
import json

def apply(slides):
    config=json.loads(Path(__file__).with_name('infographics.json').read_text())
    for art in config['slides']:
        s=slides[art['slide']-1]
        s['infographic']={
            'asset':'assets/infographics/'+art['key']+'.webp',
            'panels':art['panels'],
            'alt':art['scene'],
            'layout':'panels' if art['panels'] else 'table',
        }
        s.pop('image',None)
        if 'infographics' not in s['sources']:s['sources'].append('infographics')
    # The self-check ends with score, chart, and suggestions; practice is separate.
    art=slides[1]['infographic']
    art['panels']=[['Choose an answer','Eight everyday situations about using AI carefully.'],['Score and graph','Find out which topics need more attention.'],['Read your suggestions','Get clear ways to improve based on your answers.']]
