var ws = null;
var tm = 5000;

var registredCount = 3 ;
var wallPostCount = 5;
var loggedInCount = 7;
var myChart = null;
function validateEmail(email_id) {
    var email = document.getElementById(email_id).value;
    var emailRegEx = /^[a-zA-Z]{1}\w+(\.\w+[@]|[@])[a-zA-Z]{2,}[.][a-zA-Z]{2,3}$/;

    if ( !(emailRegEx.test(email)) ) {
	document.getElementById("signup_failed").style = "display: block";
	document.getElementById("signup_failed").innerHTML = "invalid email";
	
        return false;
    }
    else {
	document.getElementById("signup_failed").style = "display: none";
    }

    return true;
}

function clientSignUp()
{
    var password1 = document.getElementById('password').value;
    var password2 = document.getElementById('rppassword').value;

    if(!validatePassword(password1, password2)) {
	return false;
    }

    if (!validateEmail('email')) {
	return false;
    }
    
    var user = {
	'username': document.getElementById('email').value,
	'password': document.getElementById('password').value,
        'first_name': document.getElementById('fname').value,
        'family_name': document.getElementById('lname').value,
        'gender': document.getElementById('gender').value,
        'city': document.getElementById('city').value,
        'country': document.getElementById('country').value
    };

    let  body = JSON.stringify(user);
    let header = [["Content-Type", "application/json;charset=UTF-8"]];
    http_request("POST", "sign_up", body, header)
	.then(function (response)
	      {
		   console.log(response);
		  if(response["success"])
		  {
		      document.getElementById("sign_up_form").reset();
		     
		      
		      return true;
		  }
		
	      })
	.catch(function(error) {
	    console.log('Something went wrong', error);
	});
}

function http_request(type, route, body = null, header = null)
{
    var request = new XMLHttpRequest();

    return new Promise(function (resolve, reject)
		       {
			   console.log("hit kommer vi väl ändå?");
			   
			   request.onreadystatechange = function () {
			       
			       if (request.readyState !== 4) { return; }

			       // if successful
			       if (request.status >= 200 && request.status < 300) {
				   resolve(JSON.parse(request.responseText));
			       }
			       else {
				   console.log("KEKEKEKKEK");
				   reject({
				       status: request.status,
				       statusText: request.statusText
				   });
			       }
			   }
			   request.open(type, route, true);
			   
			   for(let i = 0; i < header.length; i++) {
			       request.setRequestHeader(header[i][0], header[i][1]);
			   }

			   console.log(body);
			   request.send(body);
		       });
}

function validatePassword(password1, password2) {
    if (password1 !== password2) { 
	document.getElementById("signup_failed").style = "display: block";
	document.getElementById("signup_failed").innerHTML = "invalid password";
        return false;
    }

    if (password1.length < 5) {
	document.getElementById("signup_failed").style = "display: block";
	document.getElementById("signup_failed").innerHTML = "invalid password";
        return false;
    }

    document.getElementById("signup_failed").style = "display: none";
    
    return true;
}

function create_web_socket(token)
{
    console.log("I create");
    ws = new WebSocket("ws://" + document.domain + ":5000/create_socket");  

    ws.onmessage = function (evt) {
	var msg = evt.data;
	if (msg == '__pong__') {
	    //console.log("pong");
            return;
	}

        console.log(msg);
	if(msg =='log_out')
	{
	    sessionStorage.removeItem("token");
	    displayView();
	    ws.close();
	    return
	}
	msg = JSON.parse(msg);
	wallPostCount = msg.message_count;
	loggedInCount = msg.loggedInCount;
	registredCount = msg.registredCount;
	 createCanvas();
	
    };                                                               

    ws.onopen = function (event) {
	ws.send(token);
	ws.send('__ping__');
	console.log("Socket öppnad");
    };

    ws.onclose = function(e)
    {
	console.log("Socket closed");
    };
}

function clientSignIn(email, password)
{
    var email = document.getElementById('login_email').value;
    var password = document.getElementById('login_password').value;

    let body = JSON.stringify({"username" : email, "password" : password});
    let header = [["Content-Type", "application/json;charset=UTF-8"]];

    http_request("POST", "sign_in", body, header)
	.then(function (response)
	      {
		  if(response["success"])
		  {
		      console.log("Funkar omg vad häftigt 2");
		      sessionStorage.setItem("token", response["token"]);
		      create_web_socket(response["token"]);
		      displayView();
		     // createCanvas();
		  }
		  else {
		      console.log("Funkar inte omg vad häftigt 2");
		      console.log(response);
		      displayView();
		      document.getElementById("login_f").style = "display: block";
		  }
	      })
	.catch(function(error) {
	    console.log('Something went wrong', error);
	});
    
}

async function show_my_home()
{
    var token = sessionStorage.getItem("token");
    let header = [["token", token]];
    const  res = await http_request("GET", "get_user_data_by_token", null, header);
    console.log(res);
    
    if(res["success"])
    {
	document.getElementById('Home').style = "display: block";
	document.getElementById('Browse').style = "display: none";
	document.getElementById('Account').style = "display: none";
	showHome(res["user"]);
	load_wall();
    }
}

function showHome(res) {
    var personal = null;
    
    if( document.getElementById('Home').style.display === "none")
    {
	personal = 'browse_personal_info';
    }
    else
    {
	personal = 'personal_info';
    }

    document.getElementById(personal).innerText = res[1] +
	" " + res[2] + "\n";
    document.getElementById(personal).innerText += res[0] +
	"\n" ; document.getElementById(personal).innerText +=
	res[4] + ", " + res[5] + "\n";
    document.getElementById(personal).innerText += res[3];
}

async function load_wall(email = null)
{
    var token = sessionStorage.getItem("token");
    var wall = null;
    let header = [["token", token]];    
    var res = null;
    if(email === null)
    {
	res = await http_request("GET", "get_user_messages_by_token", null, header);	
	wall = document.getElementById('wall');
    }
    else
    {
	wall = document.getElementById('browse_wall');
	res = await http_request("GET", "get_user_messages_by_email/" + email, null, header);
    }

    console.log(res);
    var data = res["messages"];
    console.log(data);
    wall.innerText = "";
    for(i = 0; i < data.length; i++)
    {
	wall.innerText += data[i][0] + " wrote: " + data[i][2] + "\n";
    }
}

async function show_other_home()
{
    var token = sessionStorage.getItem("token");
    var email = document.getElementById("user_email").value;
    
    let header = [["token", token]];
    
    const  res = await http_request("GET", "get_user_data_by_email/" + email, null, header);
    
    console.log(res);
    
    if(!res["success"])
    {
    	document.getElementById("change_password_no_success").style = "display: block";
    }
    else
    {
	document.getElementById("change_password_no_success").style = "display: none";
	showHome(res["user"]);
	load_wall(res["user"][0]);
    }
}

async function post_wall()
{
    var token = sessionStorage.getItem("token");
    var content = document.getElementById("my_text_area").value;
    let header = [["token", token], ["Content-Type", "application/json;charset=UTF-8"]];
    const  user_res = await http_request("GET", "get_user_data_by_token", null, header);

    console.log(user_res);
    let email = user_res["user"][0];
    
    let body =  {"message" : content, "email" : email};
    body = JSON.stringify(body);

    const res = await http_request("POST", "post_message", body, header);
    
    load_wall();
}

async function post_other_wall()
{
    var token = sessionStorage.getItem("token");
    var email = document.getElementById("user_email").value;
    var content = document.getElementById("browse_text_area").value;
    let body =  {"message" : content, "email" : email};
    body = JSON.stringify(body );

    let header = [["token", token], ["Content-Type", "application/json;charset=UTF-8"]];
    const res = await http_request("POST", "post_message", body, header);

    document.getElementById("browse_text_area").value = "";
    load_wall(email);

}
function showBrowse() {
    document.getElementById('Home').style = "display: none";
    document.getElementById('Browse').style = "display: block";
    document.getElementById('Account').style = "display: none";
}

function showAccount() {
    document.getElementById('Home').style = "display: none";
    document.getElementById('Browse').style = "display: none";
    document.getElementById('Account').style = "display: block";
}

async function change_password()
{
    var old_password = document.getElementById('old_password').value;
    var password = document.getElementById('new_password').value;
    var token = sessionStorage.getItem("token");

    if (token === null || password.length < 5)
    {
	document.getElementById("change_password_success").style = "display: none";
	document.getElementById("change_password_no_success2").style = "display: block";
	return;
    }

    let body =  {"old_password" : old_password, "new_password" : password};
    body = JSON.stringify(body );

    let header = [["token", token], ["Content-Type", "application/json;charset=UTF-8"]];
    const res = await http_request("PUT", "change_password", body, header);
    
    if(res["success"])
    {
	document.getElementById("change_password_success").style = "display: block";
	document.getElementById("change_password_no_success2").style = "display: none";
    }
    else
    {
	document.getElementById("change_password_success").style = "display: none";
	document.getElementById("change_password_no_success2").style = "display: block";
    }
}

async function change_password2()
{
    var old_password = document.getElementById('enter_rendered_password').value;
    var email = document.getElementById('rpass_email').value;

    let body = JSON.stringify({"username" : email, "password" : old_password});
    let header = [["Content-Type", "application/json;charset=UTF-8"]];

    await http_request("POST", "sign_in", body, header)
	.then(function(response)
	      {
		  if(response["success"]) {
		      sessionStorage.setItem("token", response["token"]);
		      create_web_socket(response["token"]);
		  }
		  else {
		      console.log("sign in failed");
		      console.log(response);
		  }
	      })
	.catch(function(error) {
	    console.log('Something went wrong here ..', error);
	});
	
    var password = document.getElementById('enter_new_password').value;
    var token = sessionStorage.getItem("token");

    body =  JSON.stringify({"old_password" : old_password, "new_password" : password});
    header = [["token", token], ["Content-Type", "application/json;charset=UTF-8"]];

    const res = await http_request("PUT", "change_password", body, header);

    console.log(res);
    
    if(res["success"])
    {
	document.getElementById("rpass_msg").innerHTML = "Your password was changed";
    }
    else
    {
	document.getElementById("rpass_msg").innerHTML = "Your password was NOT changed";
    }
}

async function resetPasswd()
{
    var email = document.getElementById('rpass_email').value;
    var token = sessionStorage.getItem("token");
    
    let body =  {"email" : email}; body = JSON.stringify(body );
    let header = [["token", token], ["Content-Type", "application/json;charset=UTF-8"]];

    const res = await http_request("PUT", "reset_password", body, header);

    console.log(res["message"])
    
    if(res["success"])
    {
	document.getElementById('ch_pwd').style = "display: block";
    }
    else
    {
	console.log("something went wrong ..");
    }
}

async function log_out()
{
    var token = sessionStorage.getItem("token");

    let header = [["token", token], ["Content-Type", "application/json;charset=UTF-8"]];
    const res = await http_request("PUT", "sign_out", null, header);

    sessionStorage.removeItem("token");
    displayView();
}

displayView = function() {
    if(sessionStorage.getItem("token") === null)
    {
	document.getElementById('container').innerHTML = document.getElementById('welcomeview').innerHTML;
    }
    else
    {
	document.getElementById('container').innerHTML = document.getElementById('signedin').innerHTML;
	show_my_home();

    }
};

window.onload = function() {

    var token = sessionStorage.getItem("token");
    create_web_socket(token);
   
    
    displayView();
    
};





//<script>
function createCanvas()
{
    
    var ctx = document.getElementById('myChart').getContext('2d');
    if(myChart != null)
    {
	myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Registred users', 'LoggedInUsers','WallPosts' ],
        datasets: [{
            label: 'CurrentCount',
            data: [registredCount, loggedInCount, wallPostCount ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
}
// </script>
