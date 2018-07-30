//play ground js
const fs = require("fs");
const assert = require("assert");

const filename = './resource/test.json';
const TYPE_PRONUNCIATION = 'pronunciation';
const TYPE_PUNCTUATION = 'punctuation';

fs.readFile(filename, (err, data) => {
  if (err) console.log(err);
  process(data);
});

function process(data) {
  const json = JSON.parse(data);
  let segments = json.results.speaker_labels.segments;
  const items_concatd = concatPunc(json.results.items);
  const items = items_concatd.filter((item) => item.type === TYPE_PRONUNCIATION);
  
  assert.equal(numberOfItemsUnderSegment(segments), items.length, 'words number error');
  
  const combinedSegments = combine(segments, items);
  
  const outputFileName = './' + json.jobName + '.json';
  outputJson(outputFileName, combinedSegments);
}

function concatPunc(raw_items) {
  console.log(raw_items.length);
  for (let i=0; i<raw_items.length; i++) {
    if (raw_items[i].type === TYPE_PUNCTUATION) {
      raw_items[i-1].alternatives[0].content += raw_items[i].alternatives[0].content;
    }
  }
  return raw_items;
}

function numberOfItemsUnderSegment(segments) {
  let n = 0;
  for (let a=0; a<segments.length; a++) {
    n += segments[a].items.length;
  }
  return n;
}

function combine(segments, items) {
  let n = 0;
  for (let i=0; i<segments.length; i++) {
    let segment = segments[i];
    for (let j=0; j<segment.items.length; j++) {
      const alt = items[n].alternatives[0];
      segment.items[j]['confidence'] = alt.confidence;
      segment.items[j]['content'] = alt.content;
      n++;
    }
    console.log(segment.items[0]);
  }
  return segments;
}

function outputJson(name, obj) {
  const jsonText = JSON.stringify(obj);
  fs.writeFile(name, jsonText, (err) => {
    if (err) throw err;
    console.log('file saved');
  });
}