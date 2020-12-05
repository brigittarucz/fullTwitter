async function getSession() {
    let connectionGetSession = await fetch(
        '../../api/get-session.php', {
            "method": "GET"
        }
    )

    let sUserId = await connectionGetSession.text();
    return sUserId;
}

function checkHttp(data, api) {

    if(data.get('tweetBody').includes("http") || data.get('tweetBody').includes("https")) {
        let substrings = data.get('tweetBody').replace(/[\n\r]/g, " ");
        substrings = substrings.split(" ");

        substrings.forEach(substring => {

            if(substring.startsWith('http') || substring.startsWith('https')) {
                httpSubstring = 1;
                (async function() {
                    urlMetadata =  await fetch('https://url-metadata.herokuapp.com/api/metadata?url=' + substring)
                    .then(response => response.json())
                    .then(data => { return data; }).catch(error => console.log(error));
                    
                    // console.log(urlMetadata);

                    if(urlMetadata.error == null ) {
                        data.set('urlImage', urlMetadata.data.image ? urlMetadata.data.image : urlMetadata.data.favicon);
                        data.set('urlTitle', urlMetadata.data.title);
                        data.set('urlDescription', urlMetadata.data.description);
                        data.set('urlName', substring.includes('https') ? substring.slice(8, substring.length) : substring.slice(7, substring.length));
                    } else {
                        console.log("error");
                    }

                    // Check for formData

                    // for (var pair of data.entries()) {
                    //     console.log(pair[0]+ ', ' + pair[1]); 
                    // };

                    let connection = await fetch(
                        api, 
                        {
                            "method": "POST",
                            "body": data
                        }
                    )
                
                    let sResponse = await connection.text();
                    console.log(sResponse);
                    
                    // TODO: append tweet 

                    getTweets();

                })();
            } 
        });

    } else if (!data.get('tweetBody').includes("http") && !data.get('tweetBody').includes("https")) {
            (async function() {
                let connection = await fetch(
                    api, 
                    {
                        "method": "POST",
                        "body": data
                    }
                )
            
                let sResponse = await connection.text();

                // TODO: append tweet

                getTweets();
            })();
    }
}

async function createTweet() {

    if (event.target.querySelector("textarea").value.length >= 10 && event.target.querySelector("textarea").value.length <= 140) {

    let sUserId = await getSession();

    var data = new FormData(select('#formTweet'));
    data.set('userId', sUserId);

    // TODO: invalid link case

    document.querySelector("#modal-tweet #formTweet").reset();

    await checkHttp(data, '../../api/api-create-tweet.php');

    } else {
       event.target.checkValidity();
    } 
}

async function generateImageUrl(randomizer, tweetHasLink) {
    if(!parseInt(tweetHasLink) && randomizer) {
        let connGetImage = await fetch(
            'https://picsum.photos/1000/1000', {
                "method": "GET"
            }
        )

        let sImageLink = await connGetImage.url;
        console.log("here");
        return sImageLink;
    } else {
        return 0;
    }
}

function formatDate(tweet_date) {
    var utcSeconds = tweet_date;
    var date = new Date(0); // Setting date to epoch
    date.setUTCSeconds(utcSeconds);

    // https://stackoverflow.com/questions/10632346/how-to-format-a-date-in-mm-dd-yyyy-hhmmss-format-in-javascript

    var formattedDate = [date.getMonth()+1,
        date.getDate(),
        date.getFullYear()].join('/');

    return formattedDate;
}

function formatHours(tweet_date) {
    var utcSeconds = tweet_date;
    var date = new Date(0); // Setting date to epoch
    date.setUTCSeconds(utcSeconds);

    // https://stackoverflow.com/questions/10632346/how-to-format-a-date-in-mm-dd-yyyy-hhmmss-format-in-javascript

    var formattedDate = [date.getHours(),
        date.getMinutes()].join(':');

    return formattedDate;
}

async function getTweets() {

    if(document.querySelector("#middle_posts-section") && document.querySelector("#middle_action-tweets")) {
        document.querySelector("#middle_posts-section").innerHTML = "";
        document.querySelector('#middle_action-tweets').innerHTML = "";
    }
    let sUserId = await getSession();

    // TODO: get user's tweets

    let connectionGetTweets = await fetch(
        '../../api/api-get-tweets.php?id=' + sUserId, {
            "method": "GET"
        }
    )

    let sTweets = await connectionGetTweets.text();
    let jTweets = JSON.parse(sTweets);


    // TODO: if they exist, remove children before inserting


    jTweets.forEach(jTweet => {

        var formattedDate = formatDate(jTweet['tweet_created']);
        var postTag = 0;
        
        // console.log(jTweets);

        let tweetBlueprint = `
        <article class="post-article" data-tweetId="${jTweet['tweet_id']}">
        <div>
        <img src="`+ (jTweet['user_profile_image'] != 'generic.png' ? ""+jTweet['user_path_profile_image']+jTweet['user_profile_image'] : "media/profile-placeholder.png") +`" alt="">
        </div>
        <div>
        <h5>${jTweet['user_full_name']} <span class="post-following">
            <svg viewBox="0 0 24 24">
                <g>
                <path
                    d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z">
                </path>
                </g>
            </svg></span> <span class="post-at">@${jTweet['user_username']}</span> <span class="post-time">&#8226; ${formattedDate}</span> <a
            href="/" ` + (jTweet['tweet_partial_display'] != 0 ? 'style="transform: rotate(90deg);"' : '') + ` data-tweetId="${jTweet['tweet_id']}" onclick="openPopup(); return false;" data-queryhidden="${jTweet['tweet_partial_display']}" data-querypopup="#popup-post" class="post-action"> <svg data-queryhidden="${jTweet['tweet_partial_display']}" data-tweetId="${jTweet['tweet_id']}" onclick="openPopup(); return false;" data-querypopup="#popup-post" viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-ip8ujx r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-27tl0q">
                <g>
                <path data-queryhidden="${jTweet['tweet_partial_display']}" data-tweetId="${jTweet['tweet_id']}" onclick="openPopup(); return false;" data-querypopup="#popup-post"
                    d="M20.207 8.147c-.39-.39-1.023-.39-1.414 0L12 14.94 5.207 8.147c-.39-.39-1.023-.39-1.414 0-.39.39-.39 1.023 0 1.414l7.5 7.5c.195.196.45.294.707.294s.512-.098.707-.293l7.5-7.5c.39-.39.39-1.022 0-1.413z">
                </path>
                </g>
            </svg> </a></h5>
        </div>
        <div style="display:` + (jTweet['tweet_partial_display'] == "0" ? 'block' : 'none') + `;">
        <p>${jTweet['tweet_body']}` + ` ` + (postTag != 0 ? `<a href="" class="post-tag">${postTag}</a>` : '') + `</p>
        </div>
        ` + (jTweet['tweet_has_link'] == "0" ? '<!--' : '')  +`
        <div class="post-article_link" style="display:` + (jTweet['tweet_partial_display'] == "0" ? 'block' : 'none') + `;">
        <img src="` + (jTweet['tweetLink_url_image'] == "false" ? '/media/link-placeholder.jpg' : jTweet['tweetLink_url_image'])  + `" alt="Tweet Image">
        <p class="title-link">${jTweet['tweetLink_url_title']}</p>
        <p class="description-link">${jTweet['tweetLink_url_description']}</p>
        <a href="/" class="source-link"><span class="source-icon"><svg viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr">
                <g>
                <path
                    d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z">
                </path>
                <path
                    d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z">
                </path>
                </g>
            </svg></span>${jTweet['tweetLink_url']}</a>
        </div> 
        ` + (jTweet['tweet_has_link'] == "0" ? '-->' : '')  +`
        ` + (jTweet['tweet_has_image'] == "0" ? '<!--' : '')  +`
        <div class="post-article_media">
        <img src="media/link.jpg" alt="">
        </div>
        ` + (jTweet['tweet_has_image'] == "0" ? '-->' : '')  +`
        <div style="margin: 1rem 0; display:` + (jTweet['tweet_partial_display'] == "0" ? 'flex' : 'none') + `;">
        <a href="/">
            <svg viewBox="0 0 24 24"
            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
            <g>
                <path
                d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z">
                </path>
            </g>
            </svg>
            9
        </a>
        <a href="/">
            <svg viewBox="0 0 24 24"
            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
            <g>
                <path
                d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z">
                </path>
            </g>
            </svg>
            5
        </a>
        <a href="/">
            <svg viewBox="0 0 24 24"
            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
            <g>
                <path
                d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z">
                </path>
            </g>
            </svg>
            30
        </a>
        <a href="/">
            <svg viewBox="0 0 24 24"
            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
            <g>
                <path
                d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z">
                </path>
                <path
                d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z">
                </path>
            </g>
            </svg>
        </a>
        </div>
    </article>
    `;
        document.querySelector("#middle_posts-section").insertAdjacentHTML('afterbegin', tweetBlueprint);
    })

    jTweets.forEach(jTweet => {


        generateImageUrl(Math.round(Math.random()), jTweet['tweet_has_link']).then(result => {

            var tweetImage = result;

            var formattedDate = formatDate(jTweet['tweet_created']);
            var postTag = 0;

            let retweetBlueprint = `
            <div class="retweet" data-tweetId="${jTweet['tweet_id']}">
                    <div>
                    <svg viewBox="0 0 24 24"
                        class="r-1re7ezh r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1xzupcd">
                        <g>
                        <path
                            d="M23.615 15.477c-.47-.47-1.23-.47-1.697 0l-1.326 1.326V7.4c0-2.178-1.772-3.95-3.95-3.95h-5.2c-.663 0-1.2.538-1.2 1.2s.537 1.2 1.2 1.2h5.2c.854 0 1.55.695 1.55 1.55v9.403l-1.326-1.326c-.47-.47-1.23-.47-1.697 0s-.47 1.23 0 1.697l3.374 3.375c.234.233.542.35.85.35s.613-.116.848-.35l3.375-3.376c.467-.47.467-1.23-.002-1.697zM12.562 18.5h-5.2c-.854 0-1.55-.695-1.55-1.55V7.547l1.326 1.326c.234.235.542.352.848.352s.614-.117.85-.352c.468-.47.468-1.23 0-1.697L5.46 3.8c-.47-.468-1.23-.468-1.697 0L.388 7.177c-.47.47-.47 1.23 0 1.697s1.23.47 1.697 0L3.41 7.547v9.403c0 2.178 1.773 3.95 3.95 3.95h5.2c.664 0 1.2-.538 1.2-1.2s-.535-1.2-1.198-1.2z">
                        </path>
                        </g>
                    </svg>
                    <p class="text-sm">
                        You Retweeted
                    </p>
                    </div>
                    <article class="post-article">
                    <div>
                        <img src="`+ (jTweet['user_profile_image'] != 'generic.png' ? ""+jTweet['user_path_profile_image']+jTweet['user_profile_image'] : "media/profile-placeholder.png") +`" alt="">
                    </div>
                    <div>
                        <h5>${jTweet['user_full_name']}<span class="post-at">@${jTweet['user_username']}</span> <span class="post-time">&#8226; ${formattedDate}</span> <a href="/"
                        ` + (jTweet['tweet_partial_display'] != 0 ? 'style="transform: rotate(90deg);"' : '') + ` onclick="openPopup(); return false;" data-queryhidden="${jTweet['tweet_partial_display']}" data-tweetId="${jTweet['tweet_id']}" data-querypopup="#popup-post" class="post-action" > <svg data-queryhidden="${jTweet['tweet_partial_display']}" data-tweetId="${jTweet['tweet_id']}" data-querypopup="#popup-post" onclick="openPopup(); return false;" viewBox="0 0 24 24"
                            class="r-4qtqp9 r-yyyyoo r-ip8ujx r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-27tl0q">
                            <g>
                                <path data-queryhidden="${jTweet['tweet_partial_display']}" data-tweetId="${jTweet['tweet_id']}" onclick="openPopup(); return false;" data-querypopup="#popup-post"
                                d="M20.207 8.147c-.39-.39-1.023-.39-1.414 0L12 14.94 5.207 8.147c-.39-.39-1.023-.39-1.414 0-.39.39-.39 1.023 0 1.414l7.5 7.5c.195.196.45.294.707.294s.512-.098.707-.293l7.5-7.5c.39-.39.39-1.022 0-1.413z">
                                </path>
                            </g>
                            </svg> </a></h5>
                    </div>
                    <div style="display:` + (jTweet['tweet_partial_display'] == 0 ? 'block' : 'none') + `;">
                    <p>${jTweet['tweet_body']}` + ` ` + (postTag != 0 ? `<a href="" class="post-tag">${postTag}</a>` : '') + `</p>
                    </div>
                    `+ (jTweet['tweet_has_link'] == 1 ? '' : '<!--') +`
                    <div class="post-article_link" style="display:` + (jTweet['tweet_partial_display'] == "0" ? 'block' : 'none') + `;">
                        <img src="` + (jTweet['tweetLink_url_image'] == "false" ? '/media/link-placeholder.jpg' : jTweet['tweetLink_url_image'])  + `" alt="">
                        <p class="title-link">${jTweet['tweetLink_url_title']}</p>
                        <p class="description-link">${jTweet['tweetLink_url_description']}</p>
                        <a href="${jTweet['tweetLink_url']}" class="source-link"><span class="source-icon"><svg viewBox="0 0 24 24"
                            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr">
                            <g>
                                <path
                                d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z">
                                </path>
                                <path
                                d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z">
                                </path>
                            </g>
                            </svg></span>entrepreneur.com</a>
                    </div>
                    `+ (jTweet['tweet_has_link'] == 1 ? '' : '-->') +`
                    `+ (jTweet['tweet_has_link'] == 0 && tweetImage != 0 ? '' : '<!--') +`
                    <div class="post-article_media" style="display:` + (jTweet['tweet_partial_display'] == "0" ? 'block' : 'none') + `;">
                        <img src="${tweetImage}" alt="">
                    </div> 
                    `+ (jTweet['tweet_has_link'] == 0 ? '' : '-->') +`
                    <div style="display:` + (jTweet['tweet_partial_display'] == "0" ? 'flex' : 'none') + `;">
                        <a href="/">
                        <svg viewBox="0 0 24 24"
                            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                            <g>
                            <path
                                d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z">
                            </path>
                            </g>
                        </svg>
                        9
                        </a>
                        <a href="/">
                        <svg viewBox="0 0 24 24"
                            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                            <g>
                            <path
                                d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z">
                            </path>
                            </g>
                        </svg>
                        5
                        </a>
                        <a href="/">
                        <svg viewBox="0 0 24 24"
                            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                            <g>
                            <path
                                d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z">
                            </path>
                            </g>
                        </svg>
                        30
                        </a>
                        <a href="/">
                        <svg viewBox="0 0 24 24"
                            class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                            <g>
                            <path
                                d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z">
                            </path>
                            <path
                                d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z">
                            </path>
                            </g>
                        </svg>
                        </a>
                    </div>
                    </article>
                </div>`;

            document.querySelector('#middle_action-tweets').insertAdjacentHTML('afterbegin', retweetBlueprint);
               
       })
 
    })


}

async function getTweet() {


    let modalPopup = event.target.parentElement.parentElement;
    event.target.parentElement.parentElement.parentElement.style.display = "none";
    tweetId = modalPopup.getAttribute('data-posttweetid');

    let sUserId = await getSession();

    let connection = await fetch(
        '../../api/api-get-tweet.php?userId='+sUserId+'&tweetId='+tweetId, 
        {
            "method": "GET"
        }
    )

    let sResponse = await connection.text();
    
    let tweet = JSON.parse(sResponse);
    tweet = tweet[0];
    var formattedDate = formatDate(tweet['tweet_created']);
    var formattedHours = formatHours(tweet['tweet_created']);

    // See tweet
    // console.log(tweet);
    var tweetDetails = `
    <div class="view" id="tweet-details">
        <form id="updateTweet" onsubmit="updateTweet(); return false;">
        <input name="previousBodyTweet" type="hidden" value="${tweet.tweet_body}">
        <input name="tweetId" type="hidden" value="${tweet.tweet_id}">
        <section id="tweet-details_header">
            <svg viewBox="0 0 24 24"
            class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue">
            <g>
                <path
                d="M20 11H7.414l4.293-4.293c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0l-6 6c-.39.39-.39 1.023 0 1.414l6 6c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L7.414 13H20c.553 0 1-.447 1-1s-.447-1-1-1z">
                </path>
            </g>
            </svg>
            <h3 class="text-lg-dark-900">Tweet</h3>
        </section>
        <section id="tweet-details_body">
            <div>
            <img src="`+ (tweet.user_profile_image != 'generic.png' ? ""+tweet.user_path_profile_image + tweet.user_profile_image : "media/profile-placeholder.png") +`" alt="">
            </div>
            <div>
            <h4 class="tweet-details_poster">${tweet.user_full_name}</h4>
            <p class="tweet-details_poster-tag text-sm">@${tweet.user_username}</p>
            </div>
            <div>
            <a href="/" class="post-action"> <svg viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-ip8ujx r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-27tl0q">
                <g>
                    <path
                    d="M20.207 8.147c-.39-.39-1.023-.39-1.414 0L12 14.94 5.207 8.147c-.39-.39-1.023-.39-1.414 0-.39.39-.39 1.023 0 1.414l7.5 7.5c.195.196.45.294.707.294s.512-.098.707-.293l7.5-7.5c.39-.39.39-1.022 0-1.413z">
                    </path>
                </g>
                </svg> </a>
            </div>

            <div class="tweet-details-text-content">
            <textarea minlength="10" maxlength="140" class="text-xl-dark-100" name="tweetBody">${tweet.tweet_body}</textarea>
            </div>
            <div class="tweet-details_media-image">
            <img src="media/image.jpg" alt="">
            </div>
            <!-- <div class="tweet-details_media-link">
        <div class="post-article_link">
        <img src="media/link.jpg" alt="">
        <p class="title-link">Repeat prescriptions—does the global economy need a new diagnosis?</p>
        <p class="description-link">Our weekly podcast on markets, the economy and business</p>
        <a href="/" class="source-link"><span class="source-icon"><svg viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr">
                <g>
                <path
                    d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z">
                </path>
                <path
                    d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z">
                </path>
                </g>
            </svg></span>entrepreneur.com</a>
        </div>
    </div> -->
        </section>
        <section class="tweet-details_time">
            <p class="text-sm">${formattedHours} &#8226;</p>
            <p class="text-sm">${formattedDate} &#8226;</p>
            <p class="text-sm">Twitter Web App</p>
        </section>
        <section class="tweet-details_stats">
            <p class="text-sm"><span class="text-sm-dark-700">287</span>Retweets</p>
            <p class="text-sm"><span class="text-sm-dark-700">174</span>Quote Tweets</p>
            <p class="text-sm"><span class="text-sm-dark-700">8.1K</span>Likes</p>
            <button type="submit" class="btn btn-tweet">Update</button>
        </section>
        <section class="tweet-details_actions">
            <div>
            <a href="/">
                <svg viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                <g>
                    <path
                    d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z">
                    </path>
                </g>
                </svg>
            </a>
            <a href="/">
                <svg viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                <g>
                    <path
                    d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z">
                    </path>
                </g>
                </svg>
            </a>
            <a href="/">
                <svg viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                <g>
                    <path
                    d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z">
                    </path>
                </g>
                </svg>
            </a>
            <a href="/">
                <svg viewBox="0 0 24 24"
                class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                <g>
                    <path
                    d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z">
                    </path>
                    <path
                    d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z">
                    </path>
                </g>
                </svg>
            </a>
            </div>
        </section>
        </form>
    </div>`;

    document.querySelectorAll(".view").forEach(domElement => {
    domElement.style.display = "none";
    })

    select("#middle").insertAdjacentHTML('afterbegin', tweetDetails);


}

async function deleteTweet() {
    let modalPopup = event.target.parentElement.parentElement;
    event.target.parentElement.parentElement.parentElement.style.display = "none";
    tweetId = modalPopup.getAttribute('data-posttweetid');

    let sUserId = await getSession();

    let connection = await fetch(
        '../../api/api-delete-tweet.php?tweetId=' + tweetId + '&userId=' + sUserId,
        {
            "method": "GET"
        }
    )

    let sResponse = await connection.text();

        console.log(sResponse);

    document.querySelector('[data-tweetid="'+tweetId+'"]').remove();
    
}

async function getProfile() {
    let sUserId = await getSession();

    let connection = await fetch(
        '../../api/api-get-lookups.php?id=' + sUserId,
        {
            "method": "GET"
        }
    )

    let sResponse = await connection.json();

    select(".profile__name-group input").value = sResponse.fullname;
    select(".profile__country-select").innerHTML = 0;
    select(".profile__gender-select").innerHTML = 0;
    select(".profile__country-previous").value = sResponse.country_id;
    select(".profile__gender-previous").value = sResponse.gender_id;

    sResponse.countries.forEach(country => {
        var option = `<option value="${country.country_id}">${country.country_name}</option>`;

        select('.profile__country-select').insertAdjacentHTML('afterbegin', option);
    })

    sResponse.genders.forEach(gender => {
        var option = `<option value="${gender.gender_id}">${gender.gender_name}</option>`;

        select('.profile__gender-select').insertAdjacentHTML('afterbegin', option);
    })

    var optionGender = `<option selected value="${sResponse.gender_id}">`+ (sResponse.gender_id == "1" ? "unset" : sResponse.gender) +`</option>`;
    select('.profile__gender-select').insertAdjacentHTML('afterbegin', optionGender);

    var optionCountry = `<option selected value="${sResponse.country_id}">`+ (sResponse.country_id == "1" ? "unset" : sResponse.country) +`</option>`;
    select('.profile__country-select').insertAdjacentHTML('afterbegin', optionCountry);
}

async function updateProfile() {
    var data = new FormData(select('#formProfile'));
    var sUserId = await getSession();
    data.append('userId', sUserId);

    const file = document.querySelector('[type=file]').files;

    if(file.length) {
        data.append('file', file);
    }

    let connection = await fetch(
        '../../api/api-file-upload.php',
        {
            "method": "POST",
            "body": data
        }
    )

    let sResponse = await connection.text();
    
    console.log(sResponse);
    if(sResponse != "0" || 
       data.get('previousUserCountry') != data.get('userCountry') ||
       data.get('previousUserGender') != data.get('userGender')) {
            data.set('userFile', sResponse);

            connection = await fetch(
                '../../api/api-update-user.php',
                {
                    "method": "POST",
                    "body": data
                }
            )
        
            sResponse = await connection.text();
            console.log(sResponse);
            window.location.reload();
       } else {
           console.log("No modifications");
       }

}

async function updateTweet() {
   
    if (event.target.querySelector("textarea").value.length >= 10 && event.target.querySelector("textarea").value.length <= 140) {

        sUserId = await getSession();

        var data = new FormData(select('#updateTweet'));
        data.set('userId', sUserId);

        // See form data values
        // for (var pair of data.entries()) {
        //     console.log(pair[0]+ ', ' + pair[1]); 
        // };

        if(data.get('previousTweetBody') != data.get('tweetBody')) {

            checkHttp(data, '../../api/api-update-tweet.php');

        };

        select("#tweet-details").style.display = "none";
        select("#middle-home").style.display = "block";
    } else {
        event.target.checkValidity();
    }
}

async function hideTweet() {

    const eventElement = event.target;

    eventElement.parentElement.parentElement.parentElement.style.display = "none"
    sTweetId = eventElement.parentElement.parentElement.getAttribute('data-posttweetid');

    sUserId = await getSession();

    var data = new FormData();

    console.log(eventElement.textContent);

    data.set('tweetId', sTweetId);
    data.set('userId', sUserId);
    data.set('hidden', eventElement.textContent == 'Unhide' ? 0 : 1);
    data.set('urlName', 'no-reset');

    let connexion = await fetch('../../api/api-update-tweet.php', 
        {
            "method": "POST",
            "body": data
        }
    )

    let sResponse = await connexion.text(); 
        console.log(sResponse);
    await getTweets();
    // console.log(sResponse);
}

function changeView() {
    var sRoute = event.target.getAttribute("href");
    if (sRoute != null) {
        sRoute = sRoute.slice(1, sRoute.length);

        document.querySelectorAll(".view").forEach(domElement => {
            domElement.style.display = "none";
        })

        if(sRoute == 'messages') {
            getConversations();
        }
        
        var previouslyClicked = select("a.active");
        if (previouslyClicked !== event.target) {

            event.target.classList.add("active");
            event.target.querySelector('svg').classList.add("active");

            previouslyClicked.classList.remove("active");
            previouslyClicked.querySelector("svg").classList.remove("active");

        }

        if (select("#middle-" + sRoute) !== null) {
            select("#middle-" + sRoute).style.display = "block";
        }
    }
}

function closeModal() {

    if(event.target.parentElement.parentElement.querySelector("textarea") == null) {
        if(event.target.getAttribute("data-queryElement") != null) {
            select(event.target.getAttribute("data-queryElement")).style.display = "none";
        }
        if (event.target.parentElement.getAttribute("data-queryElement") != null) {
            select(event.target.parentElement.getAttribute("data-queryElement")).style.display = "none";
        }
    } else if(event.target.parentElement.parentElement.querySelector("textarea").value.length >= 10 &&
    event.target.parentElement.parentElement.querySelector("textarea").value.length <= 140) {

        if(event.target.getAttribute("data-queryElement") != null) {
            select(event.target.getAttribute("data-queryElement")).style.display = "none";
        }
        if (event.target.parentElement.getAttribute("data-queryElement") != null) {
            select(event.target.parentElement.getAttribute("data-queryElement")).style.display = "none";
        }
    }
   
    // if(event.target.getAttribute("data-queryelement") == "#modal-profile") {
    //     select('[type=file]').value = "";
    // }

}

function openModal() {
    select(event.target.getAttribute("data-queryElement")).style.display = "block";
    if(event.target.getAttribute("data-queryElement") == "#modal-profile") {
        getProfile();
    }
}

function closePopup() {
    if (event.target.nodeName != 'A') {
        select(event.target.getAttribute("data-queryElement")).style.display = "none";
    }
}

function openPopup() {

    // ev.target = path / a / svg

    // Dynamically generated

    if (event.target.getAttribute("data-querypopup") != null) {
        let selector = event.target.getAttribute("data-querypopup");
        select(selector).style.display = "block";
        selector = selector.slice(1, selector.length);
        if (event.target.getAttribute("data-queryhidden") != '0') {
            select("." + selector + "_content .hide-tweet").textContent = "Unhide";
        } else {
            select("." + selector + "_content .hide-tweet").textContent = "Hide";
        }
        select("." + selector + "_content").style.top = event.target.getBoundingClientRect().top - 135 + "px";
        select("." + selector + "_content").setAttribute("data-postTweetId", event.target.getAttribute("data-tweetid"));
    }

    // Statically generated
    if (event.target.getAttribute("data-queryElement") != null) {
        select(event.target.getAttribute("data-queryElement")).style.display = "block";
    }
}

function select($element) {
    return document.querySelector($element);
}

(async function () {

    if(document.querySelector("#middle_posts-section") && document.querySelector("#middle_action-tweets")) {
        getTweets();
    }

})();
