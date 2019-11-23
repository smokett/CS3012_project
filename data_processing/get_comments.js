//This is a java script file to get data from github API and store them into database(IBM Cloudant).

//Global variable to remember owner Login and ID of a pull request.
var ownerLogin,ownerID;

//The _id to be added to each comments record.
var index = "0";



//The pouchDB instance, connect to the haskell_stack_pr_comments database from Cloudant.
var db = new PouchDB('https://fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix:e01ad0f8a3355ea74bf8efeb523cd6da8e8afe94f5a26b2e6af4a7112dd1d144@fc535eaf-52c1-47a3-acf6-c990cfa80dfd-bluemix.cloudantnosqldb.appdomain.cloud/arduino_pr_comments');

//The buffer to contain comments.
var comments=[];

var headerToken = "token a82385a7f8f290cdd5d0de7f0e392204f98b4ce0";

//
var repoAddress = "https://api.github.com/repos/arduino/Arduino/pulls";


//The url of the pull requests of a repo.
var githubAPI = repoAddress + "?per_page=100" + "&state=all";

$.ajax({
    dataType: "json",
    headers: { Authorization: headerToken},
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
        githubAPI = repoAddress + "?per_page=100" + "&state=all" + "&page=" + pages;    
        //To get one page of pull requests.
        $.ajax({
            dataType: "json",
            headers: { Authorization: headerToken},
            url: githubAPI,
            async: false,
            success:function(json,status,xhr){
         
         for(var i=0;i<json.length;i++)
         {
            //Set url for each pull request.
            githubAPI = json[i].url;
            //To get each pull request.
            $.ajax({
                dataType: "json",
                headers: { Authorization: headerToken},
                url: githubAPI,
                async: false,
                success:function (json) 
                {

                    //If the pull request has comments.
                    if(json.comments>0)
                    {
                        githubAPI = json._links.comments.href;
                    }

                     //If the pull request has review comments.
                    else
                    {
                        githubAPI = json._links.review_comments.href;
                    }

                    //Remember login and id for the PR.
                    ownerLogin = json.user.login;
                    ownerID = json.user.id;

                    //Get the comments.
                    $.ajax({
                        dataType: "json",
                        headers: { Authorization: headerToken},
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
    }
    });
    //Show progress in HTML.
    console.log("Page "+ pages + " was successfully fetched.");
    pages++;
    }


}

});
    //Upload one page of comments to the db.
    db.bulkDocs(comments).then(function (result) {
        console.log(result);
        }).catch(function (err) {
        console.log(err);
        });
    console.log("All pages was successfully uploaded to database.");
    console.log("Finished.");






