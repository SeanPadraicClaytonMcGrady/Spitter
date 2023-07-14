type featureCounts = {
  [key: string]: number;
};

export default function trainNaiveBayes(featureCounts: featureCounts) {
  const classCounts = {};

  return featureCounts;
}

// // Training phase
// function trainNaiveBayes(trainingData) {
//     const classCounts = {};
//     const featureCounts = {};

//     // Count the number of samples in each class
//     for (const { bigrams, label } of trainingData) {
//       if (classCounts[label]) {
//         classCounts[label] += 1;
//       } else {
//         classCounts[label] = 1;
//       }

//       // Count the occurrences of each bigram in each class
//       for (const bigram of bigrams) {
//         const joinedBigram = bigram.join(" ");
//         if (featureCounts[label]) {
//           featureCounts[label][joinedBigram] = (featureCounts[label][joinedBigram] || 0) + 1;
//         } else {
//           featureCounts[label] = { [joinedBigram]: 1 };
//         }
//       }
//     }

//     // Calculate prior probabilities
//     const totalSamples = Object.values(classCounts).reduce((sum, count) => sum + count, 0);
//     const priors = {};
//     for (const label in classCounts) {
//       priors[label] = classCounts[label] / totalSamples;
//     }

//     // Calculate likelihood probabilities
//     const likelihoods = {};
//     for (const label in featureCounts) {
//       likelihoods[label] = {};
//       const totalCount = Object.values(featureCounts[label]).reduce((sum, count) => sum + count, 0);
//       for (const feature in featureCounts[label]) {
//         likelihoods[label][feature] = featureCounts[label][feature] / totalCount;
//       }
//     }

//     return { priors, likelihoods };
//   }

//   // Prediction phase
//   function predictNaiveBayes(message, { priors, likelihoods }) {
//     const bigrams = message.bigrams;
//     const classes = Object.keys(priors);

//     let bestClass = null;
//     let bestScore = Number.NEGATIVE_INFINITY;

//     for (const label of classes) {
//       let score = Math.log(priors[label]);

//       for (const bigram of bigrams) {
//         const joinedBigram = bigram.join(" ");
//         if (likelihoods[label][joinedBigram]) {
//           score += Math.log(likelihoods[label][joinedBigram]);
//         }
//       }

//       if (score > bestScore) {
//         bestScore = score;
//         bestClass = label;
//       }
//     }

//     return bestClass;
//   }
