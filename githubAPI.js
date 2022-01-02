function getGithubApiResponse(apiUrl){
    //console.log(apiUrl);
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",apiUrl,false);
    Httpreq.send(null);
    x = JSON.parse(Httpreq.responseText);
    //console.log(x);
    return x;
}

function getUserDetails() {
    var username  = document.getElementById("username_inp").value;
    var apiUrl = "https://api.github.com/users/" + username;
    var userDetails = getGithubApiResponse(apiUrl);
   //userDetails = JSON.stringify(userDetails, null, 2);
    var repos = getReposForUser(username);
    repos = JSON.stringify(repos, null, 2);
    document.getElementById("userjson").innerHTML =  "<p>Username : " + userDetails.login + "</p>" + "<p>Created : " + userDetails.created_at + "</p>"
    + "<p>URL : " + userDetails.url + "</p>" + "<p>Repos URL : " + userDetails.repos_url + "</p>"  + "<p>Number of Public Repos : " + userDetails.public_repos + "</p>"
    + "<p>Updated : " + userDetails.updated_at + "</p>"; 
    //var repos = getReposForUser(username);
    //repos = JSON.stringify(repos);

    var repos = getReposForUser(username);
    d3.select("body").selectAll("svg").remove();
    
    for (var i = 0; i < repos.length; i++){
        var obj = repos[i];
        var repoName = obj["name"];
        console.log("Repo Name : " + repoName);
        createContributionChart(username, repoName);
    }
  
    }


function getReposForUser(username) {
    var apiUrl = "https://api.github.com/users/" + username + "/repos";
    return getGithubApiResponse(apiUrl);
}
function getContributorsForRepo(username, repo) {
    var apiUrl = "https://api.github.com/repos/" + username + "/" + repo + "/contributors";
    return getGithubApiResponse(apiUrl);

}

function createContributionChart(username, repo) {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

// set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);



    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// get the data
    d3.json("https://api.github.com/repos/" + username + "/" + repo + "/contributors", function(error, data) {
        if (error) throw error;

        // format the data
        data.forEach(function(d) {
            d.contributions = +d.contributions;
        });

        // Scale the range of the data in the domains
        x.domain(data.map(function(d) { return d.login; }));
        y.domain([0, d3.max(data, function(d) { return d.contributions; })]);

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.login); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d.contributions); })
            .attr("height", function(d) { return height - y(d.contributions); });

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .text("Repository : " + repo)
            .textAlign("center");
    });
}
