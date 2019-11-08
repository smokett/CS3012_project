//This is a java script file to get data from github API and store them into database(IBM Cloudant).

//Global variable to remember owner Login and ID of a pull request.
var ownerLogin,ownerID;

//The token to access to github API.
var accessToken = "?access_token=50b1b6e87b83977948087d81d2098064df6dc539";

//The url of the pull requests of a repo.
var githubAPI = "https://api.github.com/repos/commercialhaskell/stack/pulls" + accessToken + "&per_page=1";

//To get the header of the response, and pages for all pull requests.
$.getJSON(githubAPI, function(json,status,xhr){
    console.log(xhr.getResponseHeader("Link"));
    for(var i=0;i<json.length;i++)
    {
        //Set url for each pull request.
        githubAPI = json[i].url + accessToken;

        //To get each pull request.
        $.getJSON(githubAPI, function (json) {

            //If the pull request has comments.
            if(json.comments)
            {
                githubAPI = json._links.comments.href + accessToken;
            }

             //If the pull request has review comments.
            else
            {
                githubAPI = json._links.review_comments.href + accessToken;
            }

            //Remember login and id for the PR.
            ownerLogin = json.user.login;
            ownerID = json.user.id;

            //Get the comments.
            $.getJSON(githubAPI, function(json){

                //Only do operations if a PR has comments.
                if(json.length > 0)
                {
                //Put the owner information in the first element of the comment.
                json[0].owner = {"login" : ownerLogin , "id" : ownerID};
                document.getElementById("showData").innerHTML += JSON.stringify(json) + "<br>";
                }

            });
        });
    }
});