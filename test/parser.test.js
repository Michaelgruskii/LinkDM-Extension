const { parseApolloBlob } = require('../linkdm-extension.user.js');
const { blob1, blob2, blob3 } = require('./fixtures');

describe('parseApolloBlob', () => {

  describe('blob1 — Inmail: with subject on next line', () => {
    let r;
    beforeEach(() => { r = parseApolloBlob(blob1); });

    test('parses message1', () => {
      expect(r.message1).toBe('hey {{contact.first_name}} thanks for connecting!');
    });
    test('parses message2', () => {
      expect(r.message2).toBe("saw you checked out our brand campaigns list - any names on there that caught you off guard? some of them i wouldnt have expected myself haha");
    });
    test('parses inmail subject', () => {
      expect(r.inmail.subject).toBe('the campaigns list');
    });
    test('parses inmail body', () => {
      expect(r.inmail.body).toBe("I saw you downloaded our brand campaigns list and wanted to reach out - any names on there that caught you off guard? some of them i wouldnt have expected myself haha");
    });
  });

  describe('blob2 — InMail with "Subject: " prefix', () => {
    let r;
    beforeEach(() => { r = parseApolloBlob(blob2); });

    test('parses message1', () => {
      expect(r.message1).toBe('hey {{contact.first_name}} thanks for connecting!');
    });
    test('parses message2 contains Mad//Fest', () => {
      expect(r.message2).toContain('Mad//Fest');
    });
    test('strips "Subject: " prefix from inmail subject', () => {
      expect(r.inmail.subject).toBe('quick one');
    });
    test('parses inmail body contains Mad//Fest', () => {
      expect(r.inmail.body).toContain('Mad//Fest');
    });
  });

  describe('blob3 — Inmail: with subject inline after colon', () => {
    let r;
    beforeEach(() => { r = parseApolloBlob(blob3); });

    test('parses inmail subject inline', () => {
      expect(r.inmail.subject).toBe('{{account.name}} x gaming');
    });
    test('parses inmail body', () => {
      expect(r.inmail.body).toContain('gaming audiences');
    });
  });

  describe('edge cases', () => {
    test('returns null for plain text', () => {
      expect(parseApolloBlob('hey this is not apollo')).toBeNull();
    });
    test('returns null for empty string', () => {
      expect(parseApolloBlob('')).toBeNull();
    });
    test('returns null for null', () => {
      expect(parseApolloBlob(null)).toBeNull();
    });
  });
});
