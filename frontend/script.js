document.addEventListener("DOMContentLoaded", () => {
  let searchBtnEl = document.getElementById("searchBtn");
  let dataContainerEl = document.getElementById("dataContainer");
  let videoInputEl = document.getElementById("inputVideoUrl");
  let searchInputEl = document.getElementById("searchInput");
  let formEl = document.getElementById("form");
  const DEV_URL = "http://localhost:5000";
  const PROD_URL = "https://search-inside-yt-video-production.up.railway.app";

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    videoInputEl.value = url;
  });

  function formatTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = (timeInSeconds % 3600) % 60;

    return `${hours ? hours + "h : " : ""}${minutes ? minutes + "min : " : ""}${
      seconds + "sec"
    }`;
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
    if (searchInputEl.value.split(" ").length > 1) {
      for (let index = 0; index < dataFromBackend.length - 1; index++) {
        const textCombo = `${dataFromBackend[index].text} ${
          dataFromBackend[index + 1].text
        }`;
        // console.log(textCombo)
        if (
          textCombo.toLowerCase().includes(searchInputEl.value.toLowerCase())
        ) {
          filteredArr.push([
            dataFromBackend[index],
            dataFromBackend[index + 1],
          ]);
          console.log(textCombo);
        }
      }
    } else {
      dataFromBackend.forEach((transcript) => {
        if (
          transcript.text
            .toLowerCase()
            .includes(searchInputEl.value.toLowerCase())
        ) {
          filteredArr.push([transcript]);
        }
      });
    }
    filteredArr.map((result) => {
      const videoId = extractVideoId(videoInputEl.value);

      const pStartTime = document.createElement("a");
      pStartTime.setAttribute("id", "start-time-a");
      pStartTime.href = `${
        "https://youtube.com/watch?v=" +
        videoId +
        "&t=" +
        Math.floor(result[0].start) +
        "s"
      }`;
      pStartTime.target = "_blank";
      pStartTime.innerHTML = formatTime(Math.floor(result[0].start));

      const pText = document.createElement("p");
      pText.setAttribute("id", "p-text");
      pText.innerHTML = result.length > 1 ? `${result[0].text + " " + result[1].text}` : result[0].text;

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
      `${PROD_URL}/transcript?video_url=${encodeURIComponent(
        videoInputEl.value
      )}`
    )
      .then((data) => data.json())
      .then((resp) => {
        search(resp);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        searchBtnEl.innerHTML = "Search";
        searchBtnEl.disabled = false;
      });
  }
});
