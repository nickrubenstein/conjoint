const {onRequest} = require("firebase-functions/v2/https");

const mtRand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const conjoint = (featureArray, K, N, noDuplicateProfiles) => {
  const returnArray = {};

  // Generate the profiles for each task
  for (let p = 1; p <= K; p++) {
    for (let i = 1; i <= N; i++) {
      let complete = false;
      while (!complete) {
        const profileDict = {};
        let attr = 0;

        for (const [attribute, levels] of Object.entries(featureArray)) {
          attr++;
          const attrKey = `F-${p}-${attr}`;
          returnArray[attrKey] = attribute;

          const numLevels = levels.length;
          const levelIndex = mtRand(1, numLevels) - 1;

          const chosenLevel = levels[levelIndex];
          profileDict[attribute] = chosenLevel;

          const levelKey = `F-${p}-${i}-${attr}`;
          returnArray[levelKey] = chosenLevel;
        }

        let clear = true;
        if (noDuplicateProfiles && i > 1) {
          for (let z = 1; z < i; z++) {
            let identical = true;

            for (let attrTemp = 1; attrTemp <= Object.keys(featureArray).length; attrTemp++) {
              const levelKeyProfile = `F-${p}-${i}-${attrTemp}`;
              const levelKeyCheck = `F-${p}-${z}-${attrTemp}`;

              if (returnArray[levelKeyProfile] !== returnArray[levelKeyCheck]) {
                identical = false;
                break;
              }
            }

            if (identical) {
              clear = false;
              break;
            }
          }
        }

        complete = clear;
      }
    }
  }

  return returnArray;
};

exports.conjoint_energy_panel = onRequest((req, res) => {
  const featureArray = {
    "Type of Energy": [
      "Nuclear",
      "Solar",
      "Eolic",
      "Hydroelectric",
      "Hydrogen",
    ],
    "Cost per Kilowatt-hour (cents)": [
      "10 cents",
      "12 cents",
      "15 cents",
      "18 cents",
      "20 cents",
      "22 cents",
      "25 cents",
    ],
    "Reliability (Expected Annual Hours of Blackouts)": [
      "0-1 hours (High Reliability)",
      "2-5 hours (Moderate Reliability)",
      "6+ hours (Low Reliability)",
    ],
    "Safety": [
      "High Safety (Lowest historical accident rates, minimal environmental impact)",
      "Moderate Safety (Some historical accidents, moderate environmental impact)",
      "Low Safety (Frequent accidents, high environmental impact)",
    ],
  };

  const K = 5; // number of tasks
  const N = 2; // number of profiles per task
  const noDuplicateProfiles = true;

  const returnArray = conjoint(featureArray, K, N, noDuplicateProfiles);

  res.json(returnArray);
});
