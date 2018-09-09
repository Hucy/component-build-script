import 'jest';

beforeEach(() => {
  jest.resetModules();
});

test('i18n zh_CN ', async () => {
  expect.assertions(1);
  jest.doMock('yargs', () => {
    return {
      locale: jest.fn().mockReturnValue('zh_CN'),
    };
  });
  const { default: location } = await import('~src/scripts/i18n');
  expect(location).toHaveProperty(
    'start.describe',
    expect.stringMatching(/[\u4e00-\u9fa5]/),
  );
});

test('i18n default ', async () => {
  expect.assertions(1);

  jest.doMock('yargs', () => {
    return {
      locale: jest.fn().mockReturnValueOnce(''),
    };
  });
  const { default: location } = await import('~src/scripts/i18n');
  expect(location).toHaveProperty(
    'start.describe',
    expect.stringMatching(/[A-Za-z\s]/),
  );
});

test('i18n en-US ', async () => {
  expect.assertions(1);

  jest.doMock('yargs', () => {
    return {
      locale: jest.fn().mockReturnValue('en-US'),
    };
  });
  const { default: location } = await import('~src/scripts/i18n');
  expect(location).toHaveProperty(
    'start.describe',
    expect.stringMatching(/[A-Za-z\s]/),
  );
});
