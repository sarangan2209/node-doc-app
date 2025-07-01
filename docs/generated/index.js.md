/**
 * This function checks if the request includes a valid authorization header with username and password.
 * If the authorization header is valid, it returns the request. Otherwise, it returns a 401 Unauthorized response.
 * 
 * @param {Object} event - The event object containing the request.
 * 
 * @returns {Object} - Either the request object or a 401 Unauthorized response object.
 */
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const user = 'admin';
  const pass = 'password';
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

// Usage example
const event = {
  Records: [{
    cf: {
      request: {
        headers: {
          authorization: [{ value: 'Basic YWRtaW46cGFzc3dvcmQ=' }],
        },
      },
    },
  }],
};

console.log(exports.handler(event));
// Output: { status: '401', statusDescription: 'Unauthorized', ... }