async function getMainViewRecommendations() {
    var sUserId = await getSession();
    var mainViewRecommendationsContainer = select('.right_follow-section_container');

    var conn = await fetch('../../api/api-get-random-users.php?userId='+sUserId, {
        method: "GET"
    })

    var jRandomUsers = await conn.json();

    jRandomUsers.forEach(user => {
        var followBlueprint = `
        <article class="article-follow" data-userfollow-id="${user._key}">
            <img src="`+ (user.profileImage != "" ? user.profileImage : 'media/profile-placeholder.png') +`" alt="">
            <div>
            <h4>${user.fullName}</h4>
            <p>@${user.username}</p>
            </div>
            <button class="btn btn-reverse" onclick="follow()">Follow</button>
        </article>`;

        mainViewRecommendationsContainer.insertAdjacentHTML('afterbegin', followBlueprint);
    });

    
}


    // TODO: 1. Get and insert potential followers, while excluding relationships already there
    // FOR relationship IN twitterFollowersEdgesV2 FILTER relationship._from != "twitterUsersV2/4" LIMIT 2 RETURN relationship
    // TODO: 2. Add onclick follow to post relationship and update following for the user and followers for the followed count
    // TODO: 3. If succesful change element button text to following
    // TODO: 5. Show more triggers two new additions which are graph based and imply graph traversal
    // TODO: 6. Loading spinner?


async function follow() {
    // True until finished db call
    var button = event.target;
    button.disabled = true;

    var sUserId = await getSession();

    var form = new FormData();
    form.append("userFromId", sUserId);
    form.append("userToId", button.parentElement.getAttribute('data-userfollow-id'));

    var conn = await fetch('../../api/api-follow-user.php', {
        method: "POST",
        body: form
    })

    var connResponse = await conn.text();
    if(conn.status == 200) {
        console.log(connResponse);
        button.disabled = false;
        button.classList.remove("btn-reverse");
        button.textContent = "Following";
    } else if(conn.status == 201) {
        console.log(connResponse);
        button.disabled = false;
        button.classList.remove("btn-reverse");
        button.textContent = "Following";
    }

    setTimeout(() => {
       
    }, 2000);
}

getMainViewRecommendations();