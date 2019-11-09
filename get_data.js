//This is a java script file to get data from github API and store them into database(IBM Cloudant).

//Global variable to remember owner Login and ID of a pull request.
var ownerLogin,ownerID;

//The _id to be added to each comments record.
var index = "0";

//The token to access to github API.
var accessToken = "?token=034c6643979f5ef58c979c9f86658e2da6046b96";

//The pouchDB instance, connect to the haskell_stack_pr_comments database from Cloudant.
var db = new PouchDB('https://fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix:e01ad0f8a3355ea74bf8efeb523cd6da8e8afe94f5a26b2e6af4a7112dd1d144@fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix.cloudantnosqldb.appdomain.cloud/haskell_stack_pr_comments');

//The buffer to contain comments.
var comments=[];


//The url of the pull requests of a repo.
var githubAPI = "https://api.github.com/repos/commercialhaskell/stack/pulls" + accessToken + "&per_page=100" + "&state=all";

$.ajax({
    dataType: "json",
    headers: { Authorization: "token 034c6643979f5ef58c979c9f86658e2da6046b96"},
    url: githubAPI,
    async: false,
    success:function(json,status,xhr){

    //Check the number of pages of the PR.
    var pages = 1;
    var header = xhr.getResponseHeader("Link");
    var nextUrl = header.split(";");
    var lastUrl = nextUrl[1];
    lastUrl = lastUrl.substring(14,lastUrl.length-1);
    var lastPageStart = lastUrl.lastIndexOf("page=")+5;
    var  lastPage = lastUrl.substring(lastPageStart,lastUrl.length);
    var lastPageInt = parseInt(lastPage);
    nextUrl = nextUrl[0].substring(1,nextUrl[0].length-1);
    console.log(xhr.getResponseHeader("X-RateLimit-Remaining"));

    while(pages<=lastPageInt)
    {
        comments = [];
        githubAPI = "https://api.github.com/repos/commercialhaskell/stack/pulls" + accessToken + "&per_page=100" + "&state=all" + "&page=" + pages;    
        //To get one page of pull requests.
        $.ajax({
            dataType: "json",
            headers: { Authorization: "token 034c6643979f5ef58c979c9f86658e2da6046b96"},
            url: githubAPI,
            async: false,
            success:function(json,status,xhr){
            console.log(xhr.getResponseHeader("Link"));


         
         for(var i=0;i<json.length;i++)
         {
             console.log(i);
            //Set url for each pull request.
            githubAPI = json[i].url + accessToken;
            //To get each pull request.
            $.ajax({
                dataType: "json",
                headers: { Authorization: "token 034c6643979f5ef58c979c9f86658e2da6046b96"},
                url: githubAPI,
                async: false,
                success:function (json) 
                {

                    //If the pull request has comments.
                    if(json.comments>0)
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
                    $.ajax({
                        dataType: "json",
                        headers: { Authorization: "token 034c6643979f5ef58c979c9f86658e2da6046b96"},
                        url: githubAPI,
                        async: false,
                        success:function(json){

                        //Only do operations if a PR has comments.
                        if(json.length > 0)
                        {
                        //Format the record data, _id is the pimary key, login and id are the information about owner.
                        var record = {"_id":index, "login" : ownerLogin, "id" : ownerID, "comments" : json};
                        //increment _id
                        var addIndex = parseInt(index);
                        addIndex++;
                        index = addIndex.toString();
                        //save comments to local db, push it to remote later.
                            comments.push(record);
                        }
                    }
                    });
                }
                });
            
        
       
    }
    //Upload one page of comments to the db.
    db.bulkDocs(comments).then(function (result) {
        console.log(result);
      }).catch(function (err) {
        console.log(err);
      });
    }
    });
    //Show progress in HTML.
    document.getElementById("showProgress").innerHTML += "Page "+ pages + " was successfully uploaded to database." + "<br>";
    pages++;
    }

}
});
    document.getElementById("showProgress").innerHTML += "Finished." + "<br>";





