const dummyFunction = require('../src/index');

test('Dummy function to return dummy phrase', () => {
    expect(dummyFunction()).toBe('This is a super duper dummy function');
});