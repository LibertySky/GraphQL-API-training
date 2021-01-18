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

//create post
let graphqlQuery = {
	query: `
	mutation {
		createPost(postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl: "${postData.imgUrl}"}) {
			_id
			title
			content
			imageUrl
			creator {
				name 
			}
			createdAt
		}
	}
	
	`,
};
fetch('http://localhost:3021/graphql', {
	method: POST,
	body: JSON.stringify(graphqlQuery),
	headers: {
		Authorization: 'Bearer ' + this.props.token,
	},
});

// GET posts
const graphqlQuery = {
	query: `
		{
			posts(page: ${page}) {
				posts{
					_id
					title
					content
					creator {
						name
					}
					createdAt
				}
				totalPosts
			}
		}
	`,
};
fetch('http://localhost:3021/graphql', {
	method: 'POST',
	headers: {
		Authorization: 'Bearer ' + this.props.token,
		'Content-Type': 'application/json',
	},
	body: JSON.stringify(graphqlQuery),
});
