// ========================================
// FIREBASE CONFIGURATION
// ========================================
const firebaseConfig = {
  apiKey: "AIzaSyAYcypxo65Tk122TfBqaYbb3EYUk_SA3Zo",
  authDomain: "youthfarmkit-e2b72.firebaseapp.com",
  databaseURL:
    "https://youthfarmkit-e2b72-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "youthfarmkit-e2b72",
  storageBucket: "youthfarmkit-e2b72.firebasestorage.app",
  messagingSenderId: "1068769439668",
  appId: "1:1068769439668:web:ec2975de17c11109828ce1",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ========================================
// GLOBAL VARIABLES
// ========================================
let isConnected = false;
let allActivities = [];
let currentFilterProject = "";

// ========================================
// CONNECTION STATUS
// ========================================
function updateConnectionStatus(status) {
  const statusEl = document.getElementById("connectionStatus");
  const textEl = document.getElementById("statusText");

  statusEl.className = "connection-status " + status;

  if (status === "connected") {
    textEl.textContent = "Terhubung";
    isConnected = true;
  } else if (status === "disconnected") {
    textEl.textContent = "Terputus";
    isConnected = false;
  } else {
    textEl.textContent = "Menghubungkan...";
    isConnected = false;
  }
}

// Monitor Firebase connection
const connectedRef = database.ref(".info/connected");
connectedRef.on("value", (snap) => {
  if (snap.val() === true) {
    updateConnectionStatus("connected");
    console.log("✅ Firebase connected!");
  } else {
    updateConnectionStatus("disconnected");
    console.log("❌ Firebase disconnected!");
  }
});

// ========================================
// REAL-TIME DATA LISTENERS
// ========================================

// Kelembapan Tanah
database.ref("sensors/soilMoisture").on("value", (snapshot) => {
  const value = snapshot.val();
  console.log("Soil Moisture received:", value);
  if (value !== null) {
    updateSoilMoisture(value);
  }
});

// Level Air
database.ref("sensors/waterLevel").on("value", (snapshot) => {
  const value = snapshot.val();
  console.log("Water Level received:", value);
  if (value !== null) {
    updateWaterLevel(value);
  }
});

// Jarak Sensor
database.ref("sensors/distance").on("value", (snapshot) => {
  const value = snapshot.val();
  console.log("Distance received:", value);
  if (value !== null) {
    const el = document.getElementById("distance");
    if (el) el.textContent = value.toFixed(2) + " cm";
  }
});

// Status Pompa
database.ref("status/pumpOn").on("value", (snapshot) => {
  const status = snapshot.val();
  console.log("Pump Status received:", status);
  const el = document.getElementById("pumpStatus");
  if (el && status !== null) {
    el.textContent = status ? "🟢 MENYIRAM" : "⚫ MATI";
    el.className = "status-value " + (status ? "pump-on" : "pump-off");
  }
});

// Warning Air Rendah
database.ref("status/lowWaterWarning").on("value", (snapshot) => {
  const warning = snapshot.val();
  console.log("Low Water Warning received:", warning);

  const warningBox = document.getElementById("warningBox");
  const warningBoxMonitor = document.getElementById("warningBoxMonitor");

  if (warning === true) {
    if (warningBox) warningBox.classList.add("show");
    if (warningBoxMonitor) warningBoxMonitor.classList.add("show");
  } else {
    if (warningBox) warningBox.classList.remove("show");
    if (warningBoxMonitor) warningBoxMonitor.classList.remove("show");
  }
});

// ========================================
// UPDATE FUNCTIONS
// ========================================

function updateSoilMoisture(value) {
  const valueEl = document.getElementById("soilMoisture");
  const statusEl = document.getElementById("soilStatus");
  const barEl = document.getElementById("soilBar");

  // Konversi ADC (0-4095) ke persen terbalik
  const percent = 100 - (value / 4095) * 100;

  // Animate value change
  if (valueEl) {
    valueEl.classList.add("updating");
    valueEl.textContent = value;
    setTimeout(() => valueEl.classList.remove("updating"), 500);
  }

  // Update bar
  if (barEl) {
    barEl.style.width = percent + "%";
  }

  // Update status text and color
  if (statusEl) {
    if (value > 3000) {
      statusEl.textContent = "🔴 Tanah Kering - Perlu Penyiraman";
      statusEl.style.background = "rgba(239, 68, 68, 0.3)";
    } else if (value > 2000) {
      statusEl.textContent = "🟡 Kelembapan Sedang";
      statusEl.style.background = "rgba(245, 158, 11, 0.3)";
    } else {
      statusEl.textContent = "🟢 Kelembapan Optimal";
      statusEl.style.background = "rgba(16, 185, 129, 0.3)";
    }
  }

  updateLastUpdateTime();
}

function updateWaterLevel(value) {
  const valueEl = document.getElementById("waterLevel");
  const statusEl = document.getElementById("waterStatus");
  const barEl = document.getElementById("waterBar");

  // Animate value change
  if (valueEl) {
    valueEl.classList.add("updating");
    valueEl.textContent = value.toFixed(1);
    setTimeout(() => valueEl.classList.remove("updating"), 500);
  }

  // Update bar
  if (barEl) {
    barEl.style.width = value + "%";
  }

  // Update status text and color
  if (statusEl) {
    if (value <= 20) {
      statusEl.textContent = "🔴 Air Hampir Habis";
      statusEl.style.background = "rgba(239, 68, 68, 0.3)";
    } else if (value < 50) {
      statusEl.textContent = "🟡 Air Sedang";
      statusEl.style.background = "rgba(245, 158, 11, 0.3)";
    } else {
      statusEl.textContent = "🟢 Air Cukup";
      statusEl.style.background = "rgba(16, 185, 129, 0.3)";
    }
  }

  updateLastUpdateTime();
}

function updateLastUpdateTime() {
  const el = document.getElementById("lastUpdate");
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleTimeString("id-ID");
  }
}

// ========================================
// PAGE NAVIGATION
// ========================================
function showPage(pageName) {
  console.log("Pindah ke halaman:", pageName);

  var pages = document.querySelectorAll(".page");
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove("active");
  }

  document.getElementById(pageName).classList.add("active");

  var navItems = document.querySelectorAll(".nav-item");
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].classList.remove("active");
  }

  // Fix: Cek apakah event tersedia dan valid
  if (typeof event !== "undefined" && event && event.target) {
    const navItem = event.target.closest(".nav-item");
    if (navItem) {
      navItem.classList.add("active");
    }
  }
}

// ========================================
// EXPERIENCE CHECK
// ========================================

// Check if user has experience (stored in localStorage)
function checkUserExperience() {
  const hasExperience = localStorage.getItem("youthfarm_has_experience");
  return hasExperience !== null ? hasExperience === "true" : null;
}

// Handle user experience choice
function handleExperience(hasExperience) {
  const rememberChoice = document.getElementById("rememberChoice").checked;

  if (rememberChoice) {
    localStorage.setItem("youthfarm_has_experience", hasExperience.toString());
    console.log("✅ Preferensi disimpan:", hasExperience);
  }

  closeExperienceModal();

  if (hasExperience) {
    // User has experience, show add project modal
    showAddProjectModalDirect();
  } else {
    // User doesn't have experience, redirect to education page
    showPage("edukasi");

    // Update nav active state
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));
    const eduNavItem = Array.from(navItems).find(
      (item) =>
        item.getAttribute("onclick") &&
        item.getAttribute("onclick").includes("edukasi")
    );
    if (eduNavItem) eduNavItem.classList.add("active");

    setTimeout(() => {
      alert(
        "📚 Mari kita pelajari cara menanam kangkung terlebih dahulu!\n\nPilih tutorial yang sesuai dengan fase penanaman kamu."
      );
    }, 300);
  }
}

// Show experience modal
function showExperienceModal() {
  const modal = document.getElementById("experienceModal");
  if (modal) {
    modal.classList.add("show");

    // Reset checkbox
    const checkbox = document.getElementById("rememberChoice");
    if (checkbox) checkbox.checked = false;
  }
}

// Close experience modal
function closeExperienceModal() {
  const modal = document.getElementById("experienceModal");
  if (modal) {
    modal.classList.remove("show");
  }
}

// Show add project modal (with experience check)
function showAddProjectModal() {
  const userExperience = checkUserExperience();

  // If user experience is not set, show experience modal first
  if (userExperience === null) {
    console.log("❓ Preferensi belum diset, tampilkan modal pengalaman");
    showExperienceModal();
    return;
  }

  // If user has no experience, redirect to education
  if (!userExperience) {
    console.log("📚 User belum pernah, arahkan ke edukasi");
    showPage("edukasi");

    // Update nav active state
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));
    const eduNavItem = Array.from(navItems).find(
      (item) =>
        item.getAttribute("onclick") &&
        item.getAttribute("onclick").includes("edukasi")
    );
    if (eduNavItem) eduNavItem.classList.add("active");

    setTimeout(() => {
      alert(
        "📚 Mari kita pelajari cara menanam kangkung terlebih dahulu!\n\nPilih tutorial yang sesuai dengan fase penanaman kamu."
      );
    }, 300);
    return;
  }

  // User has experience, show add project modal
  console.log("✅ User sudah pernah, tampilkan form proyek");
  showAddProjectModalDirect();
}

// Show add project modal directly (without experience check)
function showAddProjectModalDirect() {
  const modal = document.getElementById("addProjectModal");
  if (modal) {
    modal.classList.add("show");

    // Set today as default date
    const dateInput = document.getElementById("projectStartDate");
    if (dateInput) {
      dateInput.valueAsDate = new Date();
    }
  }
}

// Close add project modal
function closeAddProjectModal() {
  const modal = document.getElementById("addProjectModal");
  if (modal) {
    modal.classList.remove("show");
    document.getElementById("projectForm").reset();
  }
}

// Reset experience preference
function resetExperiencePreference() {
  if (
    confirm(
      "Apakah kamu yakin ingin reset preferensi pengalaman?\n\nKamu akan ditanya lagi saat menambah proyek baru."
    )
  ) {
    localStorage.removeItem("youthfarm_has_experience");
    alert("✅ Preferensi berhasil direset!");
    console.log("🔄 Preferensi direset");

    // Hide reset button
    checkResetButton();
  }
}

// Show reset button if preference exists
function checkResetButton() {
  const hasPreference = localStorage.getItem("youthfarm_has_experience");
  const btnReset = document.getElementById("btnResetPreference");

  if (btnReset) {
    if (hasPreference !== null) {
      btnReset.style.display = "block";
      console.log("🔄 Tombol reset ditampilkan");
    } else {
      btnReset.style.display = "none";
      console.log("🔄 Tombol reset disembunyikan");
    }
  }
}

// ========================================
// PROJECT MANAGEMENT
// ========================================

// Load projects from Firebase
function loadProjects() {
  database
    .ref("projects")
    .orderByChild("createdAt")
    .on("value", (snapshot) => {
      const projectListEl = document.getElementById("projectList");
      const activityProjectSelect = document.getElementById("activityProject");
      const filterProjectSelect = document.getElementById("filterProject");
      const projects = [];

      snapshot.forEach((childSnapshot) => {
        projects.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      // Sort by date descending (newest first)
      projects.reverse();

      // Update project list in Beranda
      if (projectListEl) {
        if (projects.length === 0) {
          projectListEl.innerHTML =
            '<p class="empty-state">Belum ada proyek. Mulai tanam kangkung pertama kamu!</p>';
        } else {
          projectListEl.innerHTML = "";
          projects.forEach((project) => {
            projectListEl.innerHTML += createProjectHTML(project);
          });
        }
      }

      // Update project select in Logbook form
      if (activityProjectSelect) {
        activityProjectSelect.innerHTML =
          '<option value="">Pilih Proyek</option>';
        projects
          .filter((p) => !p.completed)
          .forEach((project) => {
            activityProjectSelect.innerHTML += `<option value="${project.id}">${project.name}</option>`;
          });
      }

      // Update filter select in Logbook
      if (filterProjectSelect) {
        filterProjectSelect.innerHTML =
          '<option value="">Semua Proyek</option>';
        projects.forEach((project) => {
          const statusText = project.completed ? " (Selesai)" : "";
          filterProjectSelect.innerHTML += `<option value="${project.id}">${project.name}${statusText}</option>`;
        });
      }
    });
}

// Create HTML for project card
function createProjectHTML(project) {
  const startDate = new Date(project.startDate);
  const today = new Date();
  const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const progress = Math.min((daysPassed / 30) * 100, 100);
  const status = project.completed ? "completed" : "active";
  const statusText = project.completed
    ? "✅ Selesai"
    : `📅 Hari ke-${daysPassed}`;

  let phaseText = "";
  if (project.completed) {
    phaseText = "✅ Proyek Selesai";
  } else if (daysPassed <= 1) {
    phaseText = "🌱 Fase Persiapan";
  } else if (daysPassed <= 10) {
    phaseText = "🌱 Fase Perkecambahan";
  } else if (daysPassed <= 20) {
    phaseText = "🌿 Fase Pembesaran";
  } else if (daysPassed <= 30) {
    phaseText = "🥬 Fase Siap Panen";
  } else {
    phaseText = "⏰ Melewati masa panen";
  }

  return `
    <div class="project-card ${status}">
      <div class="project-header">
        <div class="project-title">${project.name}</div>
        <div class="project-status ${status}">${statusText}</div>
      </div>
      <div class="project-info">
        <div class="project-info-item">
          <span class="project-info-icon">📅</span>
          <span>Mulai: ${formatDate(project.startDate)}</span>
        </div>
        <div class="project-info-item">
          <span class="project-info-icon">📍</span>
          <span>${project.location}</span>
        </div>
        <div class="project-info-item">
          <span class="project-info-icon">${phaseText}</span>
        </div>
        ${
          project.note
            ? `
        <div class="project-info-item">
          <span class="project-info-icon">📝</span>
          <span>${project.note}</span>
        </div>
        `
            : ""
        }
      </div>
      ${
        !project.completed
          ? `
      <div class="project-progress">
        <div class="progress-label">
          <span>Progress</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      `
          : ""
      }
      <div class="project-actions">
        <button class="btn-project-detail" onclick="viewProjectDetail('${
          project.id
        }')">
          📊 Detail
        </button>
        ${
          !project.completed && daysPassed >= 25
            ? `
        <button class="btn-project-complete" onclick="completeProject('${project.id}')">
          ✅ Selesai
        </button>
        `
            : ""
        }
        <button class="btn-project-delete" onclick="deleteProject('${
          project.id
        }')">
          🗑️ Hapus
        </button>
      </div>
    </div>
  `;
}

// Add new project
function addProject(event) {
  event.preventDefault();

  const name = document.getElementById("projectName").value;
  const startDate = document.getElementById("projectStartDate").value;
  const location = document.getElementById("projectLocation").value;
  const note = document.getElementById("projectNote").value;

  if (!name || !startDate || !location) {
    alert("⚠️ Mohon isi semua kolom yang wajib!");
    return;
  }

  const newProject = {
    name: name,
    startDate: startDate,
    location: location,
    note: note,
    completed: false,
    createdAt: Date.now(),
  };

  // Save to Firebase
  database
    .ref("projects")
    .push(newProject)
    .then(() => {
      closeAddProjectModal();
      alert("✅ Proyek berhasil ditambahkan! Selamat menanam! 🌱");
      console.log("✅ Proyek ditambahkan:", newProject);
    })
    .catch((error) => {
      console.error("❌ Error adding project:", error);
      alert("❌ Gagal menambahkan proyek. Coba lagi!");
    });
}

// View project detail
function viewProjectDetail(projectId) {
  console.log("📊 Lihat detail proyek:", projectId);

  // Navigate to logbook and filter by project
  showPage("logbook");

  // Update nav active state
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => item.classList.remove("active"));
  const logbookNavItem = Array.from(navItems).find(
    (item) =>
      item.getAttribute("onclick") &&
      item.getAttribute("onclick").includes("logbook")
  );
  if (logbookNavItem) logbookNavItem.classList.add("active");

  // Set filter
  setTimeout(() => {
    const filterSelect = document.getElementById("filterProject");
    if (filterSelect) {
      filterSelect.value = projectId;
      filterActivities();
    }
  }, 100);
}

// Complete project
function completeProject(projectId) {
  if (
    confirm("🎉 Selamat! Apakah kangkung sudah dipanen dan proyek ini selesai?")
  ) {
    database
      .ref("projects/" + projectId)
      .update({
        completed: true,
        completedAt: Date.now(),
      })
      .then(() => {
        alert(
          "🎉 Selamat! Proyek berhasil diselesaikan!\n\n✨ Terima kasih sudah menanam kangkung dengan YouthFarm Kit!"
        );
        console.log("✅ Proyek selesai:", projectId);
      })
      .catch((error) => {
        console.error("❌ Error completing project:", error);
        alert("❌ Gagal menyelesaikan proyek. Coba lagi!");
      });
  }
}

// Delete project
function deleteProject(projectId) {
  if (
    confirm(
      "⚠️ Yakin ingin menghapus proyek ini?\n\nSemua data aktivitas terkait akan tetap tersimpan, tapi proyek akan dihapus permanen."
    )
  ) {
    database
      .ref("projects/" + projectId)
      .remove()
      .then(() => {
        console.log("🗑️ Proyek dihapus:", projectId);
        alert("✅ Proyek berhasil dihapus!");
      })
      .catch((error) => {
        console.error("❌ Error deleting project:", error);
        alert("❌ Gagal menghapus proyek. Coba lagi!");
      });
  }
}

// ========================================
// LOGBOOK FUNCTIONALITY
// ========================================

// Load activities from Firebase
function loadActivities() {
  database
    .ref("logbook")
    .orderByChild("timestamp")
    .on("value", (snapshot) => {
      allActivities = [];

      snapshot.forEach((childSnapshot) => {
        allActivities.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      // Sort by date descending (newest first)
      allActivities.reverse();

      console.log("📖 Loaded activities:", allActivities.length);

      // Apply filter
      filterActivities();
    });
}

// Filter activities by project
function filterActivities() {
  const filterSelect = document.getElementById("filterProject");
  currentFilterProject = filterSelect ? filterSelect.value : "";

  const activityListEl = document.getElementById("activityList");

  if (!activityListEl) return;

  let filteredActivities = allActivities;
  if (currentFilterProject) {
    filteredActivities = allActivities.filter(
      (a) => a.projectId === currentFilterProject
    );
    console.log(
      "🔍 Filtered activities:",
      filteredActivities.length,
      "for project:",
      currentFilterProject
    );
  }

  if (filteredActivities.length === 0) {
    const emptyMessage = currentFilterProject
      ? "Belum ada aktivitas untuk proyek ini."
      : "Belum ada aktivitas. Tambahkan aktivitas pertama kamu!";
    activityListEl.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
  } else {
    activityListEl.innerHTML = "";
    filteredActivities.forEach((activity) => {
      activityListEl.innerHTML += createActivityHTML(activity);
    });
  }
}

// Create HTML for activity item
function createActivityHTML(activity) {
  return `
    <div class="activity-item">
      <div class="activity-header">
        <span class="activity-date">📅 ${formatDate(activity.date)}</span>
        ${
          activity.projectName
            ? `<span class="activity-project">${activity.projectName}</span>`
            : ""
        }
        <span class="activity-phase">${activity.phase}</span>
      </div>
      <div class="activity-type">${activity.type}</div>
      <div class="activity-note">${activity.note}</div>
      <div class="activity-actions">
        <button class="btn-delete" onclick="deleteActivity('${
          activity.id
        }')">🗑️ Hapus</button>
      </div>
    </div>
  `;
}

// Format date to Indonesian format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

// Add new activity
function addActivity(event) {
  event.preventDefault();

  const date = document.getElementById("activityDate").value;
  const projectId = document.getElementById("activityProject").value;
  const phase = document.getElementById("activityPhase").value;
  const type = document.getElementById("activityType").value;
  const note = document.getElementById("activityNote").value;

  if (!date || !projectId || !phase || !type || !note) {
    alert("⚠️ Mohon isi semua kolom!");
    return;
  }

  // Get project name
  database.ref("projects/" + projectId).once("value", (snapshot) => {
    const project = snapshot.val();
    const projectName = project ? project.name : "Proyek Tidak Diketahui";

    const newActivity = {
      date: date,
      projectId: projectId,
      projectName: projectName,
      phase: phase,
      type: type,
      note: note,
      timestamp: Date.now(),
    };

    // Save to Firebase
    database
      .ref("logbook")
      .push(newActivity)
      .then(() => {
        // Reset form
        document.getElementById("activityForm").reset();

        // Set today's date as default
        document.getElementById("activityDate").valueAsDate = new Date();

        // Show success message
        alert("✅ Aktivitas berhasil ditambahkan!");
        console.log("✅ Aktivitas ditambahkan:", newActivity);
      })
      .catch((error) => {
        console.error("❌ Error adding activity:", error);
        alert("❌ Gagal menambahkan aktivitas. Coba lagi!");
      });
  });
}

// Delete activity
function deleteActivity(activityId) {
  if (confirm("⚠️ Yakin ingin menghapus aktivitas ini?")) {
    database
      .ref("logbook/" + activityId)
      .remove()
      .then(() => {
        console.log("🗑️ Activity deleted:", activityId);
        alert("✅ Aktivitas berhasil dihapus!");
      })
      .catch((error) => {
        console.error("❌ Error deleting activity:", error);
        alert("❌ Gagal menghapus aktivitas. Coba lagi!");
      });
  }
}

// ========================================
// TUTORIAL
// ========================================
function showTutorial(tutorialId) {
  var tutorials = {
    "hari0-1": {
      title: "Tutorial Hari 0-1: Persiapan Bibit",
      content: `
        <div class="tutorial-content-box">
            <div style="margin-top: 1rem; text-align: center;">
                <img src="assets/tutorial/hari_0-1.jpg" alt="Benih Kangkung" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">Gambar: Benih kangkung siap tanam</p>
            </div>    
            <h3>SIAPKAN ALAT & BAHAN</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">1. Alat:</h4>
            <ul>
                <li>Kit YouthFarm</li>
                <li>Sarung tangan</li>
                <li>Sekop mini</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">2. Bahan:</h4>
            <ul>
                <li>Benih Kangkung</li>
                <li>Tanah gembur</li>
                <li>Pupuk</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>CEK & RENDAM BENIH</h3>
            <ul>
                <li>Ambil benih kangkung secukupnya.</li>
                <li>Siapkan air di tangki.</li>
                <li>Masukkan benih ke air, rendam 6-8 jam.</li>
                <li>Benih yang mengapung (bisa dibuang).</li>
                <li>Benih yang tenggelam (dipakai).</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>SIAPKAN MEDIA TANAM</h3>
            <ul>
                <li>Campur tanah + pupuk (2:1) sampai rata.</li>
                <li>Pastikan tanah tidak terlalu padat dan tidak ada banyak kerikil.</li>
                <li>Masukkan tanah ke kit, tingginya kira-kira 3/4 dari kit.</li>
                <li>Ratakan permukaan tanah, tapi jangan dipadatkan banget (biar akar gampang tumbuh).</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>MENABUR BENIH</h3>
            <ul>
                <li>Ambil benih yang sudah direndam (tiriskan terlebih dahulu airnya).</li>
                <li>Taburkan benih merata di atas permukaan tanah (usahakan tidak numpuk di satu titik).</li>
                <li>Setelah itu, tutup tipis dengan tanah kering/sekam.</li>
                <li>Jangan ditekan terlalu keras, cukup diratakan.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>PENYIRAMAN PERTAMA</h3>
            <ul>
                <li>Pakai sprayer atau siraman air yang halus.</li>
                <li>Siram sampai tanah terasa lembap, bukan becek.</li>
                <li>Kalau air sampai menggenang, miringkan sedikit pot agar kelebihan air keluar.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>PENEMPATAN POT HARI 0-1</h3>
            <p style="color: #666; line-height: 1.6;">Taruh pot di tempat yang:</p>
            <ul>
                <li>Ada cahaya, tapi tidak kena matahari terik langsung.</li>
                <li>Tidak kena hujan lebat langsung.</li>
            </ul>
        </div>
      `,
    },
    "hari2-4": {
      title: "Tutorial Hari 2-4: Benih Berkecambah",
      content: `
        <div class="tutorial-content-box">
            <div style="margin-top: 1rem; text-align: center;">
                <img src="assets/tutorial/hari_2-3.jpg" alt="Bibit Kangkung Berkecambah" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">Gambar: Bibit kangkung yang baru berkecambah (hari 2-4)</p>
            </div>    
            <h3>TANDA BENIH MULAI BERKECAMBAH</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">1. Biasanya mulai kelihatan:</h4>
            <ul>
                <li>Ada titik-titik hijau kecil nongol dari tanah.</li>
                <li>Bentuknya seperti batang mungil dengan ujung masih membawa kulit benih atau daun pertama yang masih nyatu.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">2. Kalau:</h4>
            <ul>
                <li>Hari ke-2 belum kelihatan → masih normal.</li>
                <li>Hari ke-3/4 mulai ada yang nongol → ini tanda berhasil berkecambah.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>PENGATURAN TEMPAT & CAHAYA</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">1. Posisi pot di hari 2-4 sebaiknya:</h4>
            <ul>
                <li>Tetap di tempat terang (ada cahaya alami).</li>
                <li>Tapi bukan matahari siang yang terik langsung, karena bibit masih lemah.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">2. Contoh tempat:</h4>
            <ul>
                <li>Teras rumah yang teduh.</li>
                <li>Dekat jendela yang ada cahaya.</li>
                <li>Bawah atap plastik bening.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">3. Kalau tempat terlalu gelap:</h4>
            <ul>
                <li>Bibit akan tumbuh kurus, panjang, pucat (etiolasi).</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>HAL YANG PERLU DICEK SETIAP HARI</h3>
            <p style="color: #666; line-height: 1.6;">Di hari 2-4, kamu bisa cek:</p>
            <h4 style="margin-top: 1rem; color: #2c5364;">a. Kelembapan tanah</h4>
            <ul>
                <li>Sentuh dengan jari:
                    <ul style="margin-left: 1.5rem; margin-top: 0.3rem;">
                        <li>Kalau masih lembap → aman.</li>
                        <li>Kalau kering & pecah-pecah → perlu disiram.</li>
                    </ul>
                </li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">b. Kemunculan tunas</h4>
            <ul>
                <li>Sudah ada yang muncul?</li>
                <li>Kalau banyak yang muncul, artinya semai kamu berhasil.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">c. Gangguan</h4>
            <ul>
                <li>Semut, kucing, ayam, dll. Kadang suka mengacak-acak media tanam.</li>
                <li>Kalau ada, pot bisa dipindah ke tempat yang lebih aman.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>KONDISI YANG TERMASUK NORMAL</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">Jangan panik kalau:</h4>
            <ul>
                <li>Tidak semua benih tumbuh barengan (ada yang cepat, ada yang lambat).</li>
                <li>Ada sebagian kecil benih yang tidak tumbuh (benih memang nggak 100% sempurna).</li>
            </ul>
            <p style="color: #666; line-height: 1.6; margin-top: 0.5rem;">Selama masih ada banyak yang berkecambah, itu normal.</p>
        </div>
        <div class="tutorial-content-box">
            <h3>TANDA ADA MASALAH DI HARI 2-4</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">1. Kamu perlu waspada kalau:</h4>
            <ul>
                <li>Tidak ada satu pun tunas yang muncul sampai hari ke-4/5 → kemungkinan:
                    <ul style="margin-left: 1.5rem; margin-top: 0.3rem;">
                        <li>Benih jelek/kadaluarsa.</li>
                        <li>Benih tanam terlalu dalam.</li>
                        <li>Media terlalu kering atau terlalu becek.</li>
                    </ul>
                </li>
                <li>Tanah berbau busuk dan sangat basah → itu tanda kelebihan air, akar bisa busuk.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">2. Kalau gagal, bukan akhir dunia kok! Biasanya cukup ganti:</h4>
            <ul>
                <li>Benih yang lebih bagus.</li>
                <li>Media tanam yang lebih gembur & bersih.</li>
                <li>Cara siram yang lebih hati-hati.</li>
            </ul>
        </div>
      `,
    },
    "hari5-10": {
      title: "Tutorial Hari 5-10: Daun Muda",
      content: `
        <div class="tutorial-content-box">
            <div style="margin-top: 1rem; text-align: center;">
                <img src="assets/tutorial/hari_5-10.jpg" alt="Kangkung Umur 5-10 Hari" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">Gambar: Kangkung umur 5-10 hari dengan daun muda yang mulai tumbuh</p>
            </div>
            <h3>CAHAYA & POSISI POT</h3>
            <p style="color: #666; line-height: 1.6;">Di umur 5–10 hari, kangkung sudah boleh kena matahari pagi</p>
            <h4 style="margin-top: 1rem; color: #2c5364;">Ideal:</h4>
            <ul>
                <li>Kena sinar matahari 3–5 jam/hari, terutama pagi.</li>
                <li>Siang terik bisa agak diteduhkan (pakai atap plastik/naungan).</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Kalau kurang cahaya:</h4>
            <ul>
                <li>Tanaman jadi kurus, tinggi, pucat, mudah rebah.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Kalau kepanasan parah:</h4>
            <ul>
                <li>Daun bisa gosong kecokelatan di tepi, tanah cepat kering.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>MENJARANGKAN TANAMAN (KALAU TERLALU RAPAT)</h3>
            <p style="color: #666; line-height: 1.6;">Di hari 5–10 ini kamu bisa:</p>
            <ul>
                <li>Pilih tanaman yang kelihatan paling sehat & tegak.</li>
                <li>Tanaman yang kecil/lemah bisa:
                    <ul style="margin-left: 1.5rem; margin-top: 0.3rem;">
                        <li>Dicabut pelan dan dibuang, atau</li>
                        <li>Dipindah ke pot lain (kalau akarnya tidak terlalu rusak).</li>
                    </ul>
                </li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Jarak ideal antar tanaman kira-kira:</h4>
            <ul>
                <li>2–3 cm untuk di pot/tray padat.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>CEK HAMA & GANGGUAN</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">Hama kecil:</h4>
            <ul>
                <li>Misalnya ulat kecil atau serangga yang makan daun.</li>
                <li>Bisa diambil manual pakai tangan.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Binatang sekitar:</h4>
            <ul>
                <li>Kucing, ayam, atau anak kecil bisa menginjak atau mengacak-acak pot.</li>
                <li>Solusi: taruh di tempat yang agak tinggi atau diberi pembatas.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Kalau ada daun yang:</h4>
            <ul>
                <li>Robek parah/berlubang banyak, bisa dipotong saja daunnya. Tanaman masih bisa tumbuh lagi.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>YANG KAMU HARUS LIHAT DI AKHIR HARI KE-10</h3>
            <p style="color: #666; line-height: 1.6;">Kalau semuanya lancar, di sekitar hari ke-10:</p>
            <h4 style="margin-top: 1rem; color: #2c5364;">Tanaman terlihat:</h4>
            <ul>
                <li>Tinggi sekitar 7–10 cm.</li>
                <li>Daun hijau segar, tidak kuning massal.</li>
                <li>Batang mulai agak kuat, tidak terlalu mudah rebah.</li>
                <li>Tanaman mulai tampak "mengisi" pot, tapi belum terlalu padat.</li>
            </ul>
            <p style="color: #10b981; line-height: 1.6; margin-top: 1rem; font-weight: 600;">✅ Ini artinya tanaman siap masuk ke fase berikutnya: Hari 11–20 → Pembesaran & penggemukan batang 💪🌿</p>
        </div>
        <div class="tutorial-content-box">
            <h3>PENYIRAMAN RUTIN</h3>
            <ul>
                <li>Penyiraman dilakukan 2 kali sehari: pagi (jam 07.00) dan sore (jam 17.00).</li>
                <li>Gunakan gembor atau sprayer agar air tidak merusak tanaman.</li>
                <li>Jaga kelembapan tanah tetap 80-100%, tapi tidak menggenang.</li>
            </ul>
        </div>
      `,
    },
    "hari11-20": {
      title: "Tutorial Hari 11-20: Pembesaran",
      content: `
        <div class="tutorial-content-box">
            <div style="margin-top: 1rem; text-align: center;">
                <img src="assets/tutorial/hari_11-20.jpg" alt="Kangkung Umur 11-20 Hari" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">Gambar: Kangkung umur 11-20 hari dengan daun lebat dan batang yang kokoh</p>
            </div>    
            <h3>CAHAYA & POSISI</h3>
            <p style="color: #666; line-height: 1.6;">Sekarang kangkung sudah cukup kuat untuk:</p>
            <h4 style="margin-top: 1rem; color: #2c5364;">Dapat matahari pagi–siang ringan:</h4>
            <ul>
                <li>Idealnya 4–6 jam/hari.</li>
                <li>Siang yang terlalu terik banget bisa:
                    <ul style="margin-left: 1.5rem; margin-top: 0.3rem;">
                        <li>Diteduhkan sedikit (misal ditaruh di bawah paranet/atap plastik).</li>
                    </ul>
                </li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Kalau cahaya cukup:</h4>
            <ul>
                <li>Daun hijau cerah, batang kokoh.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Kalau kurang cahaya:</h4>
            <ul>
                <li>Tanaman tinggi kurus, gampang rebah, warna pucat.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>PUPUK DI UMUR 11–20 HARI</h3>
            <p style="color: #666; line-height: 1.6;">Sedikit kompos/pupuk kandang matang ditabur tipis di permukaan tanah.</p>
            <h4 style="margin-top: 1rem; color: #2c5364;">Cara pemakaian:</h4>
            <h4 style="margin-top: 1rem; color: #2c5364; font-size: 0.95rem;">Pupuk cair:</h4>
            <ul>
                <li>Campur dengan air sesuai anjuran (jangan terlalu pekat).</li>
                <li>Siram di tanah, jangan terlalu banyak ke daun.</li>
                <li>Cukup 1× di rentang umur 11–20 hari (misal umur 14–15 hari).</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364; font-size: 0.95rem;">Kompos padat:</h4>
            <ul>
                <li>Tabur sangat tipis di permukaan tanah, lalu siram supaya larut pelan-pelan.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #ef4444;">⚠️ Jangan berlebihan:</h4>
            <ul>
                <li>Kalau pupuk kimia terlalu pekat → daun bisa terbakar, akar rusak.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>CEK HAMA & PENYAKIT</h3>
            <p style="color: #666; line-height: 1.6;">Di fase ini daun sudah cukup besar, jadi kadang:</p>
            <ul>
                <li>Ada ulat/serangga kecil yang makan daun → ambil manual dengan tangan.</li>
                <li>Ada bintik kuning/cokelat di daun:
                    <ul style="margin-left: 1.5rem; margin-top: 0.3rem;">
                        <li>Bisa dari percikan pupuk pekat atau jamur.</li>
                        <li>Daun yang rusak parah boleh dipotong.</li>
                    </ul>
                </li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">Jaga:</h4>
            <ul>
                <li>Pot di tempat yang cukup sirkulasi udara (tidak pengap).</li>
                <li>Tanah tidak terlalu becek.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>PENYIRAMAN RUTIN</h3>
            <ul>
                <li>Penyiraman tetap 2 kali sehari: pagi dan sore.</li>
                <li>Perhatikan kelembapan tanah, jangan sampai kering atau menggenang.</li>
                <li>Gunakan air bersih untuk menghindari penyakit.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>PERKEMBANGAN DI AKHIR HARI KE-20</h3>
            <p style="color: #666; line-height: 1.6;">Jika perawatan optimal, tanaman akan:</p>
            <ul>
                <li>Tinggi sekitar 15–20 cm.</li>
                <li>Batang lebih tebal dan kokoh.</li>
                <li>Daun tumbuh lebat dengan warna hijau segar.</li>
                <li>Siap memasuki fase panen dalam 7-10 hari ke depan.</li>
            </ul>
            <p style="color: #10b981; line-height: 1.6; margin-top: 1rem; font-weight: 600;">✅ Kangkung hampir siap dipanen! 🌿🎉</p>
        </div>
      `,
    },
    "hari21-30": {
      title: "Tutorial Hari 21-30: Siap Panen",
      content: `
        <div class="tutorial-content-box">
            <div style="margin-top: 1rem; text-align: center;">
                <img src="assets/tutorial/hari_21-30.jpg" alt="Kangkung Siap Panen" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;">Gambar: Kangkung umur 21-30 hari yang sudah siap dipanen</p>
            </div>    
            <h3>KONDISI TANAMAN</h3>
            <p style="color: #666; line-height: 1.6;">Biasanya:</p>
            <ul>
                <li>Tinggi sekitar 25–30 cm (bisa lebih).</li>
                <li>Daun lebat, batang sudah kelihatan gemuk.</li>
                <li>Kalau potnya kecil, dari atas sudah penuh hijau.</li>
            </ul>
            <p style="color: #667eea; line-height: 1.6; margin-top: 1rem; font-weight: 600;">✨ Ini fase di mana kamu mantau, bukan banyak utak-atik.</p>
        </div>
        <div class="tutorial-content-box">
            <h3>FOKUS PERAWATAN</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">a. Air</h4>
            <ul>
                <li>Tetap siram 1–2× sehari.</li>
                <li>Jangan sampai:
                    <ul style="margin-left: 1.5rem; margin-top: 0.3rem;">
                        <li>Tanah kering pecah → tanaman layu.</li>
                        <li>Atau becek terus → akar bisa busuk.</li>
                    </ul>
                </li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">b. Cahaya</h4>
            <ul>
                <li>Matahari pagi–siang ringan tetap bagus, 4–6 jam.</li>
                <li>Kalau panas banget, boleh sedikit diteduhkan.</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #2c5364;">c. Jangan dipupuk berat lagi</h4>
            <ul>
                <li>Di umur segini, kalau mau panen umur 25–30 hari, pupuk berat sudah tidak perlu.</li>
                <li>Kalau mau tambah, cukup sangat tipis dan jangan mepet hari panen.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>CARA PANEN YANG BENAR</h3>
            <h4 style="margin-top: 1rem; color: #2c5364;">Cara potong standar:</h4>
            <ul>
                <li>Pegang rumpun kangkung dekat pangkal.</li>
                <li>Gunakan gunting/pisau tajam atau tangan.</li>
                <li>Potong 3–5 cm di atas permukaan tanah, jangan terlalu pendek.</li>
                <li>Jangan cabut akarnya kalau mau coba regrow (tumbuh lagi).</li>
            </ul>
            <h4 style="margin-top: 1rem; color: #10b981;">✅ Alasan dipotong agak atas:</h4>
            <ul>
                <li>Supaya dari pangkal yang tersisa nanti bisa keluar tunas baru.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>HAL YANG PERLU DIHINDARI MENJELANG & SAAT PANEN</h3>
            <ul>
                <li>❌ Jangan semprot pupuk kimia tepat sebelum panen.</li>
                <li>❌ Jangan panen saat tanah sangat becek (kotor & licin).</li>
                <li>❌ Jangan menarik batang terlalu keras sampai akar ikut terangkat (kalau mau regrow).</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>WAKTU PANEN TERBAIK</h3>
            <ul>
                <li>Panen dilakukan pada pagi hari (jam 06.00-08.00) saat tanaman masih segar.</li>
                <li>Hindari panen saat terik matahari karena kangkung mudah layu.</li>
                <li>Kangkung siap panen saat berumur 25-30 hari setelah tanam.</li>
            </ul>
        </div>
        <div class="tutorial-content-box">
            <h3>TIPS REGROW (PANEN BERULANG)</h3>
            <ul>
                <li>Setelah panen pertama, beri pupuk organik tipis.</li>
                <li>Siram secara teratur seperti biasa.</li>
                <li>Tunas baru akan muncul dalam 7-10 hari.</li>
                <li>Bisa dipanen lagi dalam 2-3 minggu ke depan.</li>
            </ul>
            <p style="color: #10b981; line-height: 1.6; margin-top: 1rem; font-weight: 600;">🎉 Selamat! Kangkung kamu berhasil dipanen! 🥬✨</p>
        </div>
      `,
    },
  };

  var tutorial = tutorials[tutorialId];
  if (tutorial) {
    document.getElementById("tutorialContent").innerHTML =
      "<h2>" + tutorial.title + "</h2>" + tutorial.content;
    document.getElementById("tutorial-detail").classList.add("active");
    document.getElementById("edukasi").classList.remove("active");
  }
}

// ========================================
// INITIALIZE
// ========================================
console.log("🌱 YouthFarm Kit initialized");
updateLastUpdateTime();

// Initialize Projects
loadProjects();

// Initialize Logbook
loadActivities();

// Set today's date as default when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("📱 DOM Content Loaded");

  // Set default dates
  const dateInput = document.getElementById("activityDate");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }

  const projectStartDate = document.getElementById("projectStartDate");
  if (projectStartDate) {
    projectStartDate.valueAsDate = new Date();
  }

  // Check if reset button should be shown
  checkResetButton();

  console.log("✅ Initialization complete");
});

// Close modal when clicking outside
window.onclick = function (event) {
  const addProjectModal = document.getElementById("addProjectModal");
  const experienceModal = document.getElementById("experienceModal");

  if (event.target == addProjectModal) {
    closeAddProjectModal();
  }

  if (event.target == experienceModal) {
    closeExperienceModal();
  }
};
