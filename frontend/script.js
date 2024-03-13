document.addEventListener("DOMContentLoaded", () => {
  let searchBtnEl = document.getElementById("searchBtn");
  let dataContainerEl = document.getElementById("dataContainer");
  let videoInputEl = document.getElementById("inputVideoUrl");
  let searchInputEl = document.getElementById("searchInput");
  let formEl = document.getElementById("form");

    // chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    //   let url = tabs[0].url;
    //   videoInputEl.value = url;
    // });

  function formatTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = (timeInSeconds % 3600) % 60;

    return `${hours ? hours + "h:" : ""}${minutes ? minutes + "min : " : ""}${seconds + "sec"}`;
  }

  function extractVideoId(url) {
    const pattern =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
    return null;
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchDataFromBackend();
  });

  function search(dataFromBackend) {
    let filteredArr = [];
    dataContainerEl.innerHTML = "";
    dataFromBackend.map((transcript) => {
      if (
        transcript.text
          .toLowerCase()
          .includes(searchInputEl.value.toLowerCase())
      ) {
        filteredArr.push(transcript);
        console.log(transcript.text);
      }
    });
    filteredArr.map((result) => {
      const videoId = extractVideoId(videoInputEl.value);

      const pStartTime = document.createElement("a");
      pStartTime.setAttribute("id", "start-time-a");
      pStartTime.href = `${
        "https://youtube.com/watch?v=" +
        videoId +
        "&t=" +
        Math.floor(result.start) +
        "s"
      }`;
      pStartTime.target = "_blank";
      pStartTime.innerHTML = formatTime(Math.floor(result.start))

      const pText = document.createElement("p");
      pText.setAttribute("id", "p-text");
      pText.innerHTML = result.text;

      const div = document.createElement("div");
      div.setAttribute("id", "groupDiv");
      div.appendChild(pStartTime);
      div.appendChild(pText);

      dataContainerEl.appendChild(div);

      searchBtnEl.innerHTML = "Search";
      searchBtnEl.disabled = false;
    });
  }

  function fetchDataFromBackend() {
    searchBtnEl.innerHTML = "Searching...";
    searchBtnEl.disabled = true;
    fetch(
      `https://search-inside-yt-video.vercel.app/transcript?video_url=${encodeURIComponent(
        videoInputEl.value
      )}`
    )
      .then((data) => data.json())
      .then((resp) => {
        search(resp);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }
});
