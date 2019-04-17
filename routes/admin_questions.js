var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var isAdmin = auth.isAdmin;

// Imports the Google Cloud client library.
const {
  Storage
} = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: '/media/limpidcoder/Chintan/nodejs/cmscart/interview-fa8e0-34a58fc786bb.json'
});

const dialogflow = require('dialogflow');

const LANGUAGE_CODE = 'en-US'
const projectId = 'interview-fa8e0'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'limpidcoder';
const textMessage = 'hello';
const languageCode = 'en-US';

class DialogFlow {
  constructor(projectId) {
    this.projectId = projectId


    let keyFilename = '/media/limpidcoder/Chintan/nodejs/cmscart/interview-fa8e0-34a58fc786bb.json'
    let clientEmail = 'limpid.coder@gmail.com'
    let config = {
      keyFilename: keyFilename
    }

    this.sessionClient = new dialogflow.SessionsClient(config)
    // Instantiates the Intent Client
    this.intentsClient = new dialogflow.IntentsClient(config);

    // The path to identify the agent that owns the created intent.





  }

  async sendTextMessageToDialogFlow(textMessage, sessionId) {
    // Define session path
    const sessionPath = this.sessionClient.sessionPath(this.projectId, sessionId);
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textMessage,
          languageCode: LANGUAGE_CODE
        }
      }
    }
    try {
      let responses = await this.sessionClient.detectIntent(request)
      console.log(responses);
      return responses
    } catch (err) {
      console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
      throw err
    }
  }

  createIntent(
    projectId,
    displayName,
    trainingPhrasesParts,
    messageTexts
  ) {



    this.agentPath = this.intentsClient.projectAgentPath(projectId);
    const trainingPhrases = [];

    trainingPhrasesParts.forEach(trainingPhrasesPart => {
      const part = {
        text: trainingPhrasesPart,
      };

      // Here we create a new training phrase for each provided part.
      const trainingPhrase = {
        type: 'EXAMPLE',
        parts: [part],
      };

      trainingPhrases.push(trainingPhrase);
    });

    const messageText = {
      text: messageTexts,
    };

    const message = {
      text: messageText,
    };

    const intent = {
      displayName: displayName,
      trainingPhrases: trainingPhrases,
      messages: [message],
    };

    const createIntentRequest = {
      parent: this.agentPath,
      intent: intent,
    };

    // Create the intent
    this.intentsClient
      .createIntent(createIntentRequest)
      .then(responses => {
        console.log(`Intent ${responses[0].name} created`);
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
    // [END dialogflow_create_intent]
  }

  async listIntents(projectId) {

    this.projectAgentPath = this.intentsClient.projectAgentPath(projectId);
    //name = projects/<Project ID>/agent/intents/<Intent ID>
    const request = {
      parent: this.projectAgentPath,
    };

    console.log(this.projectAgentPath);

    // Send the request for listing intents.
    return this.intentsClient
      .listIntents(request)
      .then(responses => {
        return responses;

      })
      .catch(err => {
        console.error('Failed to list intents:', err);
      });
    // [END dialogflow_list_intents]
  }


  deleteIntent(projectId, intentId) {

    this.intentPath = this.intentsClient.intentPath(projectId, intentId);


    const request = {
      name: this.intentPath
    };

    // Send the request for deleting the intent.
    return this.intentsClient
      .deleteIntent(request)
      .then(console.log(`Intent ${this.intentPath} deleted`))
      .catch(err => {
        console.error(`Failed to delete intent ${this.intentPath}:`, err);
      });
    // [END dialogflow_delete_intent]
  }

}
var testDialog = new DialogFlow(projectId);

/*
 * GET interviews index
 */
/*
 * GET interviews index
 */

router.get('/', isAdmin, function(req, res) {
  var count;

  var IntentList = testDialog.listIntents(projectId);
  var testArray = [];
  var promiseTest = IntentList.then(function(result) {

    res.render('admin/questions', {
      intents: result[0],
      count: result[0].length
    });
  });




});

/*
 * GET add question
 */
router.get('/add-question', isAdmin, function(req, res) {

  var intentName = "";
  var trainingPhrasesParts = "";
  var messageTexts = "";
  var projectId = "";



  res.render('admin/add_question', {
    displayName: intentName,
    trainingPhrasesParts: trainingPhrasesParts,
    messageTexts: messageTexts,
    projectId: projectId
  });



});

/*
 * POST add question
 */
router.post('/add-question', function(req, res) {


  req.checkBody('displayName', 'Intent Name is required').notEmpty();
  req.checkBody('trainingPhrasesParts', 'Phrases is required').notEmpty();
  req.checkBody('messageTexts', 'Response text is required').notEmpty();




  var intentName = req.body.displayName;
  var trainingPhrasesParts = req.body.trainingPhrasesParts;
  var messageTexts = req.body.messageTexts;
  var projectId = testDialog.projectId;

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add_interview', {
      errors: errors,
      intentName: intentName,
      trainingPhrasesParts: trainingPhrasesParts,
      messageTexts: messageTexts,


    });
  } else {

    testDialog.createIntent(projectId, intentName, [trainingPhrasesParts], [messageTexts]);




    req.flash('success', 'Question Added');
    res.redirect('/admin/questions');

  }


});

/*
 * GET edit question
 */
router.get('/edit-question/:id', isAdmin, function(req, res) {

  var errors;

  if (req.session.errors)
    errors = req.session.errors;
  req.session.errors = null;



  Intent.findById(req.params.id, function(err, p) {
    if (err) {
      console.log(err);
      res.redirect('/admin/intents');
    } else {

      res.render('admin/edit_intent', {
        projectId: p.projectId,
        displayName: p.displayName,
        trainingPhrasesParts: p.trainingPhrasesParts,
        messageTexts: p.messageTexts,
        id: p.intentId
      });


    }
  });



});

/*
 * POST edit interview
 */
// router.post('/edit-interview/:id', function(req, res) {
//
//   var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
//
//   req.checkBody('emailid', 'Title must have a value.').notEmpty();
//   req.checkBody('skypeid', 'Description must have a value.').notEmpty();
//   req.checkBody('cellnumber', 'Price must have a value.').isDecimal();
//   req.checkBody('weblink', 'You must upload an image').notEmpty();
//   req.checkBody('skypelink', 'You must upload an image').notEmpty();
//
//   var emailid = req.body.emailid;
//   var skypeid = req.body.skypeid;
//   var cellnumber = req.body.cellnumber;
//   var weblink = req.body.weblink;
//   var skypelink = req.body.skypelink;
//
//   var errors = req.validationErrors();
//
//   if (errors) {
//     req.session.errors = errors;
//     res.redirect('/admin/interviews/edit-interview/' + id);
//   } else {
//     Interview.findOne({
//       emailid: emailid,
//       _id: {
//         '$ne': id
//       }
//     }, function(err, p) {
//       if (err)
//         console.log(err);
//
//       if (p) {
//         req.flash('danger', 'EmailId exists, choose another.');
//         res.redirect('/admin/interviews/edit-interview/' + id);
//       } else {
//         Interview.findById(id, function(err, p) {
//           if (err)
//             console.log(err);
//
//           p.emailid = emailid;
//           p.skypeid = skypeid;
//           p.cellnumber = cellnumber;
//           p.weblink = weblink;
//           p.skypelink = skypelink;
//
//
//           p.save(function(err) {
//             if (err)
//               console.log(err);
//
//             req.flash('success', 'Question edited!');
//             res.redirect('/admin/intents/edit-intent/' + id);
//           });
//
//         });
//       }
//     });
//   }
//
// });


/*
 * GET delete interview
 */
router.get('/delete-question/:id', isAdmin, function(req, res) {

  var id = req.params.id;

  Intent.findByIdAndRemove(id, function(err) {
    console.log(err);
  });

  req.flash('success', 'Interview deleted!');
  res.redirect('/admin/intents');

});

// Exports
module.exports = router;