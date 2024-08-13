const { NlpManager } = require('node-nlp');

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'] });

// Load data
const data = require('../data/nlpExampleData');
const nlpExampleData = require('../data/nlpExampleData');

// Add the data to the NLP manager
for (const data of nlpExampleData) {
    manager.addDocument('en', data.text, data.intent);
}

// Train the model
(async () => {
    await manager.train();
    manager.save('./model.nlp'); // Save the model to a file
})();

// Function to classify text
exports.classifyText = async (req, res) => {
    const text = req.body.text;
    console.log(`Received text: ${text}`);

    const response = await manager.process('en', text);

    if (response.intent && response.score) {
        res.json({ label: response.intent, score: response.score });
    } else {
        res.status(500).json({ error: 'No classification result' });
    }
};
