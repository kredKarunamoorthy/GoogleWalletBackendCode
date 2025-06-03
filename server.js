const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const credentials = require('./credentials.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Replace with your actual values
const ISSUER_ID = '3388000000000941296';
const EVENT_CLASS_ID = `${ISSUER_ID}.eventClass`;
const PRIVATE_KEY = credentials.private_key;
const CLIENT_EMAIL = credentials.client_email;

app.post('/generate-pass', async (req, res) => {
  const { userId, ticketId } = req.body;
  const objectId = `${ISSUER_ID}.${userId}_${ticketId}`;

  const payload = {
    iss: CLIENT_EMAIL,
    aud: 'google',
    origins: ['*'],
    typ: 'savetowallet',
    payload: {
      eventTicketObjects: [
        {
          id: objectId,
          classId: EVENT_CLASS_ID,
          state: 'ACTIVE',
          heroImage: {
            sourceUri: {
              uri: 'https://example.com/image.jpg',
              description: 'Event Hero Image'
            }
          },
          textModulesData: [
            {
              header: 'Event Name',
              body: 'React Native Live 2025'
            }
          ],
          barcode: {
            type: 'QR_CODE',
            value: `${userId}-${ticketId}`
          },
          seatInfo: {
            seat: 'C12',
            row: '5',
            section: 'Gold',
            gate: 'Main'
          },
          ticketHolderName: userId,
        }
      ]
    }
  };

  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
  res.json({ saveUrl });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
