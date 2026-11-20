import data from '../src/data/scenarios.json';
import {validateScenarios} from '../src/schema';
validateScenarios(data);
console.log('PASS: 30 complete missions, six collections, 180 concealed clues, choices, debriefs, image prompts, and NIST mappings.');
