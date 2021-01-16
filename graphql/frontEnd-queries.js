// loginHandler
const graphqlQuery = {
	query: `
{
login(email: "${authData.email}", password: "${authData.password}"){
  token
  userId
}
}
`,
};
fetch('http://localhost:3021/auth/login', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({ graphqlQuery }),
});

// signupHandler
const graphqlQuery = {
	query: `
    mutation {
      createUser(userInput: {email: "${authData.signupForm.email.value}", name:"${authData.signupForm.name.value}", password:"${authData.signupForm.password.value}"}) {
        _id
        email
      }
    }
  `,
};
fetch('http://localhost:3021/graphql', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify(graphqlQuery),
});
