async function getMainViewRecommendations() {
    var sUserId = await getSession();
    var mainViewRecommendationsContainer = select('.right_follow-section_container');

    // TODO: 0. Limit in messages the search
    // TODO: 1. Get and insert potential followers, while excluding relationships already there
    // FOR relationship IN twitterFollowersEdgesV2 FILTER relationship._from != "twitterUsersV2/4" LIMIT 2 RETURN relationship
    // TODO: 2. Add onclick follow to post relationship and update following for the user and followers for the followed count
    // TODO: 3. If succesful change element button text to following
    // TODO: 4. Delete one trend and and add two more to who to follow
    // TODO: 5. Show more triggers two new additions which are graph based and imply graph traversal
    // TODO: 6. 

    var conn = await fetch('../../api/api-get-random-users.php?userId='+sUserId, {
        method: "GET"
    })

    var jRandomUsers = await conn.json();

    jRandomUsers.forEach(user => {
        var followBlueprint = `
        <article class="article-follow" data-userfollow-id="${user.id}">
            <img src="`+ (user.profileImage != "" ? user.profileImage : 'media/profile-placeholder.png') +`" alt="">
            <div>
            <h4>${user.fullName}</h4>
            <p>@${user.username}</p>
            </div>
            <button class="btn btn-reverse">Follow</button>
        </article>`;

        mainViewRecommendationsContainer.insertAdjacentHTML('afterbegin', followBlueprint);
    });

    
}

getMainViewRecommendations();