const map = L.map("map", {
  zoomControl: true,
  attributionControl: true
}).setView([43.2389, 76.8897], 12);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const networkParticipants = [
  {
    id: 1,
    name: "Green Market",
    role: "Food donor",
    category: "Fresh produce",
    amount: "32 kg available",
    coords: [43.245, 76.91],
    verified: true
  },
  {
    id: 2,
    name: "Sunrise Bakery",
    role: "Food donor",
    category: "Bakery surplus",
    amount: "18 kg available",
    coords: [43.238, 76.875],
    verified: true
  },
  {
    id: 3,
    name: "Hope Children's Home",
    role: "Charity",
    category: "Prepared meals",
    amount: "Needs 25 kg",
    coords: [43.25, 76.86],
    verified: true
  },
  {
    id: 4,
    name: "Almaty Community Kitchen",
    role: "Charity",
    category: "Fresh produce",
    amount: "Needs 20 kg",
    coords: [43.232, 76.9],
    verified: true
  },
  {
    id: 5,
    name: "Talgar Organic Farm",
    role: "Farm",
    category: "Compost / animal feed",
    amount: "Accepts surplus",
    coords: [43.28, 76.95],
    verified: true
  }
];

networkParticipants.forEach((participant) => {
  const color =
    participant.role === "Food donor" ? "#38f2b1" :
    participant.role === "Charity" ? "#4c8dff" : "#9d6bff";

  const marker = L.circleMarker(participant.coords, {
    radius: 11,
    color,
    fillColor: color,
    fillOpacity: .85,
    weight: 2
  }).addTo(map);

  marker.bindPopup(`
    <strong>${participant.name}</strong><br>
    ${participant.role}<br>
    ${participant.category}<br>
    ${participant.amount}<br>
    ${participant.verified ? "✅ Verified" : "⏳ Verification pending"}
  `);
});

const mapStatus = document.getElementById("mapStatus");
const locateButton = document.getElementById("locateButton");

locateButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    mapStatus.textContent = "GPS is not supported by this browser.";
    return;
  }

  mapStatus.textContent = "Requesting location permission...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = [
        position.coords.latitude,
        position.coords.longitude
      ];

      map.setView(userLocation, 14);

      L.circleMarker(userLocation, {
        radius: 12,
        color: "#ffcf5c",
        fillColor: "#ffcf5c",
        fillOpacity: .9
      })
        .addTo(map)
        .bindPopup("Your approximate location")
        .openPopup();

      mapStatus.textContent =
        "Location enabled. Nearby matches can now be prioritized by distance.";
    },
    () => {
      mapStatus.textContent =
        "Location permission denied. You can still browse the network manually.";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
});

const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const matchOutput = document.getElementById("matchOutput");
const matchButton = document.getElementById("matchButton");
const matchQuery = document.getElementById("matchQuery");
const userRole = document.getElementById("userRole");

function addChatMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `chat-message ${sender}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function calculateMatch(query, role) {
  const text = query.toLowerCase();

  if (!text) {
    return {
      title: "More information needed",
      detail: "Enter the food type, quantity, pickup window, and whether refrigeration is required.",
      coords: [43.2389, 76.8897]
    };
  }

  if (text.includes("bread") || text.includes("bakery") || text.includes("pastry")) {
    return {
      title: "Hope Children's Home",
      detail: "High compatibility for bakery surplus. Same-day pickup recommended to preserve freshness.",
      coords: [43.25, 76.86]
    };
  }

  if (text.includes("vegetable") || text.includes("fruit") || text.includes("produce")) {
    return {
      title: "Almaty Community Kitchen",
      detail: "Strong match for fresh produce. Capacity and cold storage should be confirmed before dispatch.",
      coords: [43.232, 76.9]
    };
  }

  if (text.includes("meal") || text.includes("cooked") || text.includes("restaurant")) {
    return {
      title: "Hope Children's Home",
      detail: "Prepared meals require immediate pickup and temperature-safe transport.",
      coords: [43.25, 76.86]
    };
  }

  if (text.includes("compost") || text.includes("animal") || text.includes("spoiled")) {
    return {
      title: "Talgar Organic Farm",
      detail: "Suitable for circular agricultural use only if food safety requirements are met.",
      coords: [43.28, 76.95]
    };
  }

  return {
    title: "Almaty Community Kitchen",
    detail: "General recipient match. Add food category, quantity, expiry information, and pickup location for higher accuracy.",
    coords: [43.232, 76.9]
  };
}

function runMatch() {
  const query = matchQuery.value.trim();
  const role = userRole.value;
  const match = calculateMatch(query, role);

  matchOutput.innerHTML = `
    <strong>${match.title}</strong>
    <p class="muted">${match.detail}</p>
  `;

  addChatMessage(
    `Recommended match: ${match.title}. ${match.detail}`,
    "assistant"
  );

  map.setView(match.coords, 14);
}

matchButton.addEventListener("click", runMatch);

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = chatInput.value.trim();

  if (!text) {
    return;
  }

  addChatMessage(text, "user");
  chatInput.value = "";

  setTimeout(() => {
    const match = calculateMatch(text, userRole.value);
    addChatMessage(
      `Based on your message, I recommend ${match.title}. ${match.detail}`,
      "assistant"
    );

    matchOutput.innerHTML = `
      <strong>${match.title}</strong>
      <p class="muted">${match.detail}</p>
    `;

    map.setView(match.coords, 14);
  }, 650);
});

const authModal = document.getElementById("authModal");
const openAuth = document.getElementById("openAuth");
const closeAuth = document.getElementById("closeAuth");

openAuth.addEventListener("click", () => {
  authModal.classList.add("active");
});

closeAuth.addEventListener("click", () => {
  authModal.classList.remove("active");
});

authModal.addEventListener("click", (event) => {
  if (event.target === authModal) {
    authModal.classList.remove("active");
  }
});

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const account = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    accountType: document.getElementById("accountType").value,
    verificationStatus: "pending"
  };

  localStorage.setItem("rewildAiDraftAccount", JSON.stringify(account));

  signupForm.reset();

  alert(
    "Account draft saved locally.\n\nIn the production version, this would create a secure account and begin identity verification."
  );
});
const animatedElements = document.querySelectorAll(
  ".section, .glass-card, .join-card"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: .15
  }
);

animatedElements.forEach((element) => {
  observer.observe(element);
});