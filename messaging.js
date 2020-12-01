async function sendMessage() {

    var form = new FormData(event.target);
    form.append("messageBody", event.target.querySelector("textarea").value);

    var conn = await fetch('api/api-messaging.php', {
        method: "POST",
        body: form
    });

    var sResponse = await conn.json();
    console.log(sResponse);
    if (conn.status == 201) {
        var htmlContainer = document.querySelector(".middle_texts-container");

        var articleText = `
        <article class="middle_text-to">
            <p class="text-to_message">${sResponse.message.message}</p>
            <br>
            <br>
            <small class="text-to_date">${sResponse.message.created}</small>
        </article>
        `;

        htmlContainer.insertAdjacentHTML('beforeend', articleText);
    }
    // TODO else if conn is not

}


function returnWriteMessage() {
    // TODO: add this to view change
    document.querySelector("#middle_write-section").style.display = "none";
    document.querySelector("#middle_messages-section").style.display = "block";

    document.querySelector(".middle_write-header").remove();
    document.querySelector(".middle_write-user_details").remove();
    document.querySelector(".middle_write-message").innerHTML = "";
    document.querySelector(".middle_texts-container").innerHTML = "";

    localStorage.removeItem('chatCount');
    localStorage.getItem("chatCount");

    clearInterval(fetchViewDataInterval);
}

var fetchViewDataInterval;

function getViewWrite() {
    console.log(event.target);
    var userEvent = event.target;
    fetchViewDataInterval = setInterval(() => {
        buildViewWrite(userEvent);
        var element = document.querySelector(".middle_texts-container");
        element.scrollTop = element.scrollHeight;
    }, 1000);
}

async function buildViewWrite(userEvent) {
    document.querySelector("#middle_write-section").style.display = "block";
    document.querySelector("#middle_messages-section").style.display = "none";

    var form = new FormData();

    // GET conversation history
    if (userEvent.getAttribute("data-chatid")) {
        form.append("chatId", userEvent.getAttribute("data-chatid"));
    };

    // GET user
    form.append("receiverId", userEvent.getAttribute("data-messageto"));

    var conn = await fetch('api/api-get-conversation.php', {
        method: "POST",
        body: form
    })

    
    var sResponse = await conn.text();
    // console.log(sResponse);
    // console.log(JSON.parse(sResponse));

    console.log(sResponse);
    var receiverData = JSON.parse(sResponse);
    if (!document.querySelector(".middle_write-header")) {

        var htmlContainerWrite = document.querySelector("#middle_write-section");

        var receiverTemplate = `
        <div class="middle_write-header"> 
          <a href="/return" onclick="returnWriteMessage(); return false;"><svg viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue"><g><path d="M20 11H7.414l4.293-4.293c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0l-6 6c-.39.39-.39 1.023 0 1.414l6 6c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L7.414 13H20c.553 0 1-.447 1-1s-.447-1-1-1z"></path></g></svg></a>
          <div class="article_write-image">
            <img src="` + (receiverData.receiverImage === "" ? "/media/profile-placeholder.png" : receiverData.receiverImage) + `" alt="">
          </div>
          <div>
            <p class="article_write-username">${receiverData.fullName}</p>
            <p class="article_write-at">@${receiverData.username}</p>
          </div>
        </div>
        <div class="middle_write-user_details">
          <div>
            <p class="p_write-username">${receiverData.fullName}</p>
            <p class="p_write-at">@${receiverData.username}</p>
          </div>
          <div>
            <p class="p_write-following">${receiverData.following} following</p>
            <p class="p_write-followers">${receiverData.followers} followers</p>
          </div>
          <div>
            <p class="p_write-joined"><svg viewBox="0 0 24 24" class="r-1re7ezh r-4qtqp9 r-yyyyoo r-1xvli5t r-7o8qx1 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M19.708 2H4.292C3.028 2 2 3.028 2 4.292v15.416C2 20.972 3.028 22 4.292 22h15.416C20.972 22 22 20.972 22 19.708V4.292C22 3.028 20.972 2 19.708 2zm.792 17.708c0 .437-.355.792-.792.792H4.292c-.437 0-.792-.355-.792-.792V6.418c0-.437.354-.79.79-.792h15.42c.436 0 .79.355.79.79V19.71z"></path><circle cx="7.032" cy="8.75" r="1.285"></circle><circle cx="7.032" cy="13.156" r="1.285"></circle><circle cx="16.968" cy="8.75" r="1.285"></circle><circle cx="16.968" cy="13.156" r="1.285"></circle><circle cx="12" cy="8.75" r="1.285"></circle><circle cx="12" cy="13.156" r="1.285"></circle><circle cx="7.032" cy="17.486" r="1.285"></circle><circle cx="12" cy="17.486" r="1.285"></circle></g></svg> Joined October 2020</p>
        </div>
      `;

        htmlContainerWrite.insertAdjacentHTML('afterbegin', receiverTemplate);

        var htmlContainerChat = document.querySelector(".middle_write-message");

        var chatTemplate = `
        <div>
          <svg class="svg-cta" viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue"><g><path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22h-.003c-.2 0-.393.08-.532.224l-4.317 4.384-1.813-1.806c-.14-.14-.33-.22-.53-.22-.193-.03-.395.08-.535.227L3.5 17.642V4.25c0-.413.337-.75.75-.75zm-.744 16.28l5.418-5.534 6.282 6.254H4.25c-.402 0-.727-.322-.744-.72zm16.244.72h-2.42l-5.007-4.987 3.792-3.85 4.385 4.384v3.703c0 .413-.337.75-.75.75z"></path><circle cx="8.868" cy="8.309" r="1.542"></circle></g></svg>
        </div>
        <div>
          <svg class="svg-cta" viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue"><g><path d="M19 10.5V8.8h-4.4v6.4h1.7v-2h2v-1.7h-2v-1H19zm-7.3-1.7h1.7v6.4h-1.7V8.8zm-3.6 1.6c.4 0 .9.2 1.2.5l1.2-1C9.9 9.2 9 8.8 8.1 8.8c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c1 0 1.8-.4 2.4-1.1v-2.5H7.7v1.2h1.2v.6c-.2.1-.5.2-.8.2-.9 0-1.6-.7-1.6-1.6 0-.8.7-1.6 1.6-1.6z"></path><path d="M20.5 2.02h-17c-1.24 0-2.25 1.007-2.25 2.247v15.507c0 1.238 1.01 2.246 2.25 2.246h17c1.24 0 2.25-1.008 2.25-2.246V4.267c0-1.24-1.01-2.247-2.25-2.247zm.75 17.754c0 .41-.336.746-.75.746h-17c-.414 0-.75-.336-.75-.746V4.267c0-.412.336-.747.75-.747h17c.414 0 .75.335.75.747v15.507z"></path></g></svg>
        </div>
        <form onsubmit="sendMessage(); return false;">
          <input type="text" name="receiverId" hidden value="${receiverData.receiverId}">
          <input type="text" name="receiverFullname" hidden value="${receiverData.fullName}">
          <input type="text" name="receiverUsername" hidden value="${receiverData.username}">
          <input type="text" name="receiverImage" hidden value="${receiverData.receiverImage}">
          <textarea type="text" style="resize:none; width: 22vw;">Hey you how has it been going?</textarea>
          <button type="submit"><svg viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue"><g><path d="M21.13 11.358L3.614 2.108c-.29-.152-.64-.102-.873.126-.23.226-.293.577-.15.868l4.362 8.92-4.362 8.92c-.143.292-.08.643.15.868.145.14.333.212.523.212.12 0 .24-.028.35-.087l17.517-9.25c.245-.13.4-.386.4-.664s-.155-.532-.4-.662zM4.948 4.51l12.804 6.762H8.255l-3.307-6.76zm3.307 8.26h9.498L4.948 19.535l3.307-6.763z"></path></g></svg></button>
        </form>
      `;

        htmlContainerChat.insertAdjacentHTML('afterbegin', chatTemplate);
    }

    console.log(!localStorage.getItem("chatCount"));

    if (receiverData.chatHistory) {
        if ((!localStorage.getItem("chatCount")) || (localStorage.getItem("chatCount") != receiverData.chatHistory.length)) {
            document.querySelector(".middle_texts-container").innerHTML = "";
            var chatHistoryData = receiverData.chatHistory;
            var htmlContainerChatHistory = document.querySelector(".middle_texts-container");
            chatHistoryData.forEach(message => {
                if (message.receiverId != receiverData.receiverId) {
                    var messageFromTemplate = `
              <article class="middle_text-from">
                <div>
                  <img src="` + (receiverData.receiverImage === "" ? "media/profile-placeholder.png" : receiverData.receiverImage) + `">
                  <p class="text-from_message">${message.messageBody}</p>
                </div>
                <small class="text-from_date">${message.messageTimestamp}</small>
              </article>
              `;
                    htmlContainerChatHistory.insertAdjacentHTML('afterbegin', messageFromTemplate);
                } else {
                    var messageToTemplate = `
              <article class="middle_text-to">
                <p class="text-to_message">${message.messageBody}</p>
                <br>
                <br>
                <small class="text-to_date">${message.messageTimestamp}</small>
              </article>
              `;
                    htmlContainerChatHistory.insertAdjacentHTML('afterbegin', messageToTemplate);
                }
            })
        }

        localStorage.setItem("chatCount", receiverData.chatHistory.length);

    }

}


async function searchUser() {

    var form = new FormData(event.target);

    if (form.get("userSearch") != "") {

        var conn = await fetch('api/api-search-users.php', {
            method: "POST",
            body: form
        })

        var sResponse = await conn.text();

        // console.log(sResponse);
        var aSearchResults = JSON.parse(sResponse);
        var htmlContainer = document.querySelector(".middle_messages-container");

        if (aSearchResults.length) {
            htmlContainer.innerHTML = "";

            aSearchResults.forEach(searchResult => {
                var userMessage = `
          <a href="/message" onclick="getViewWrite(); return false;" data-messageto="${searchResult.key}">
              <article class="article_message"> 
                <div class="article_message-image">
                  <img src="`+ (searchResult.profileImage == "" ? "media/profile-placeholder.png" : searchResult.profileImage)  +`" alt="">
                </div>
                <div>
                  <p class="article_message-username">${searchResult.fullName}</p>
                  <p class="article_message-at">@${searchResult.username}</p>
                </div>
              </article>
          </a>
        `;

                htmlContainer.insertAdjacentHTML('beforeend', userMessage);
            })

        } else {
            htmlContainer.innerHTML = "Your search query did not yield any results. Consider modifying your search and have minimum 3 letters.";
        }
    } else {
        getConversations();
    }
}


async function getConversations() {

    var conn = await fetch('api/api-get-conversations.php', {
        method: "GET"
    })

    var sResponse = await conn.text();
    console.log(sResponse);
    if (conn.status == 200) {
        var htmlContainer = document.querySelector(".middle_messages-container");
        htmlContainer.innerHTML = "";

        var jUserMessages = JSON.parse(sResponse);
        // TODO: format date
        // TODO: add random image picker array

        jUserMessages.forEach(jUserMessage => {
            var userMessage = `
      <a href="/message" onclick="getViewWrite(); return false;" data-messageto="${jUserMessage.receiverId}" data-chatid="${jUserMessage.chatId}">
            <article class="article_message"> 
              <div class="article_message-image">
                <img src="` + (jUserMessage.receiverImage === "" ? "/media/profile-placeholder.png" : jUserMessage.receiverImage) + `" alt="">
              </div>
              <div>
                <p class="article_message-username">${jUserMessage.receiverFullName}</p>
                <p class="article_message-at">@${jUserMessage.receiverUsername}</p>
              </div>
              <div> 
                <p class="last_message-date">${jUserMessage.lastMessageDate}</p>
              </div>
              <div> 
                <p class="last_message">${jUserMessage.lastMessage}</p>
              </div>
            </article>
      </a>
      `;

            htmlContainer.insertAdjacentHTML('beforeend', userMessage);
        })
    }

    // TODO else if conn is not
}