exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  const authString = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

  if (
    headers.authorization &&
    headers.authorization[0].value === authString
  ) {
    return request;
  }

  return {
    status: '401',
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': [
        {
          key: 'WWW-Authenticate',
          value: 'Basic realm="Restricted Area"',
        },
      ],
    },
    body: 'Authentication required',
  };
};
