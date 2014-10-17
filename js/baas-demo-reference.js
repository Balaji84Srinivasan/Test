<!-- STEP 2: Add API BaaS Connection -->
  apigeeClient = new Apigee.Client({
      orgName:'attdevjam',
      appName:'sandbox'
  });
<!-- End STEP 2 -->

<!-- STEP 4: Add loadUsers() function -->
  my_users = new Apigee.Collection({ "client":apigeeClient, "type":"users" });
  function loadUsers (){
    my_users.fetch(function () {
      while (my_users.hasNextEntity() ) {
        var current_user = my_users.getNextEntity();
        if (current_user.get('username') != 'arthur'){
        $('#contentdiv').append("<div class='item'> <a href='#'> <img class='avatar' src='img/smallred.png'/>"
                   + "<strong class='name'>" +current_user.get('username') + "</strong>"
                   + " <span class='username '>@"+current_user.get('username') +"</span>"
                   + "</a><span class='button follow' id='"+ current_user.get('username') +"'>Follow </span> </div>");
               }
            }
        },
        function () {
          alert("Failed to read Users");
        }
    );
  }
<!-- End STEP 4 -->

<!-- STEP 6: Add EventListeners -->
  $(".follow, .following").live('click', function() {
    $(this).toggleClass('following follow').unbind("hover");
    if($(this).is('.follow')){
        var element = $(this);
        var userID = element.attr("id");
        createRelationship ('arthur',userID,'unfollows');
        createActivitySteam("arthur",userID,"unfollows");
        $(this).text("Follow");
    }
    else{
        var element = $(this);
        var userID = element.attr("id");
        createRelationship ('arthur',userID,'follows');
        createActivitySteam("arthur",userID,"follows");
        $(this).bind({mouseleave:function(){ $(this).text("Following");}, mouseenter:function(){
            $(this).text("Unfollow"); }
        });
    }
});
<!-- End STEP 6 -->

<!-- STEP 7: Add createRelationship() function -->
  function createRelationship (follower, leader, relationship){
    var connecting_entity_options = {
        client: apigeeClient, data: {
            type:'users', username: follower
        }
    };
    var connecting_entity = new Apigee.Entity(connecting_entity_options);
    var connected_entity_options = {
        client: apigeeClient,
        data: {
            type:'users', username:leader
        }
    };
    var connected_entity = new Apigee.Entity(connected_entity_options);
    if (relationship == 'follows'){
        connecting_entity.connect(relationship, connected_entity,function (error, result) {
            if (error) {
                alert ("Error occurred while creating the link between Arthur & "+leader);
            }
            else {
                console.log ("Successfully created the link between Arthur & "+leader);
            }
        });
    }
    else {
        connecting_entity.disconnect('follows', connected_entity, function (error, result) {
            if (error) {
                alert ("Error occurred while removing the link between Arthur & "+leader);
            }
            else {
                console.log ("Successfully created the link between Arthur & "+leader);
            }
        });
    }
}
<!-- End STEP 7 -->

<!-- STEP 8: Add createActivitySteam() function -->
  function createActivitySteam(follower,leader,activity){
    var options = {
      method:'POST',
      endpoint:'users/'+follower+'/activities',
      body: {
              "actor":{
                "displayName":"Arthur",
                "username":follower,
                "content": follower +" "+ activity + " " + leader
              },
              "verb":"post"
            }
      };
      apigeeClient.request(options, function (err, data) {
      if (err) {
            console.log('Write failed!');
            alert("An error occcurred while creating the activity stream in Apigee");
      } else {
            console.log('Write success!');
      }
    });
}
<!-- End STEP 8 -->
