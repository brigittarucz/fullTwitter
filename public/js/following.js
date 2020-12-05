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
    // console.log(connResponse);
    if(conn.status == 200) {
        console.log(connResponse);
        button.disabled = false;
        button.classList.remove("btn-reverse");
        button.textContent = "Following";
        button.onclick = "";
    } else if(conn.status == 201) {
        console.log(connResponse);
        button.disabled = false;
        button.classList.remove("btn-reverse");
        button.textContent = "Following";
        button.onclick = "";
    }

}

getMainViewRecommendations();

async function getRecommended() {
    var sUserId = await getSession();
    var mainViewRecommendationsContainer = select('.middle_recommended-section_container');
    mainViewRecommendationsContainer.innerHTML = "";

    var conn = await fetch('../../api/api-get-recommendations.php?userId='+sUserId, {
        method: "GET"
    })

    var jRecommendedUsers = await conn.json();

    if(jRecommendedUsers.length < 3) {
        mainViewRecommendationsContainer.textContent = "Your search query was not narrow enough. Follow more users to narrow your recommendations.";
    }

    jRecommendedUsers.forEach(recommended => {
        var recommendedBlueprint = `
        <article class="article-recommended">
                  <img src="`+ (recommended.profileImage != "" ? recommended.profileImage : 'media/profile-placeholder.png') +`" alt="">
                  <div>
                    <h4>${recommended.fullName}</h4>
                    <p>@${recommended.username}</p>             
                  </div>
                  <div>
                    <!-- <p><span style="font-weight: 600;">3</span> connections</p> -->
                  </div>
                  <button class="btn btn-reverse">Follow</button>
        </article>`;
    
        mainViewRecommendationsContainer.insertAdjacentHTML('afterbegin', recommendedBlueprint);
    });
   
}