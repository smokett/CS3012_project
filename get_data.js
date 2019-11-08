var accessToken = "access_token=3bc25978641fbdf0eef033d91634a7031b8fbceb";

//This is used to show the header of  a response.
var githubAPI = "https://api.github.com/repos/jquery/jquery/contributors?" + accessToken + "&per_page=100";
$.getJSON(githubAPI, function(data,status,xhr){
console.log(xhr.getResponseHeader("X-RateLimit-Limit"));
});

$.getJSON(githubAPI, function (json) {
        run = true;
        localStorage.setItem('contributors_Jquery', JSON.stringify(json));
        for(var j=0;j<json.length;j++)
        {
        document.getElementById("showData").innerHTML += json[j].login + "<br>";
        }
});