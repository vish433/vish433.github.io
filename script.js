const designForm = document.getElementById('designForm');
const designTitle = document.getElementById('designTitle');
const designDescription = document.getElementById('designDescription');
const designImageInput = document.getElementById('designImage');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const galleryGrid = document.getElementById('galleryGrid');
const authButton = document.getElementById('authButton');
const ownerLoginForm = document.getElementById('ownerLoginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const authStatus = document.getElementById('authStatus');
const uploadSection = document.getElementById('upload');
const ownerUploadButton = document.getElementById('ownerUploadButton');
const uploadNavLink = document.getElementById('uploadNavLink');
const loginSection = document.getElementById('login');
const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');
const contactStatus = document.getElementById('contactStatus');
const contactSubmit = document.getElementById('contactSubmit');

const STORAGE_KEY = 'artncraft-designs';
const AUTH_KEY = 'artncraft-owner-loggedin';
const VALID_USERNAME = 'dhanu123';
const VALID_PASSWORD = 'Welcome@123';
const CONTACT_ENDPOINT = window.location.protocol === 'file:' ? 'http://localhost:3000/api/contact' : '/api/contact';
let currentEditId = null;

function loadDesigns() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveDesigns(designs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

function renderGallery() {
  const loggedIn = isOwnerLoggedIn();
  const designs = loadDesigns().filter((design) => design.owner !== false);
  galleryGrid.innerHTML = '';

  if (!designs.length) {
    galleryGrid.innerHTML = '<p class="empty-message">Only owner designs are shown here. Please login to add a new creation.</p>';
    return;
  }

  designs.forEach((design) => {
    const card = document.createElement('article');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${design.image || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'500\' viewBox=\'0 0 800 500\'%3E%3Crect width=\'800\' height=\'500\' fill=\'%23f7e6f1\'/%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23c27ba0\' font-size=\'28\' font-family=\'Arial, sans-serif\'%3ENo image supplied%3C/text%3E%3C/svg%3E'}" alt="${design.title}" />
      <div>
        <h4>${design.title}</h4>
        <p>${design.description}</p>
        ${loggedIn ? '<div class="card-actions"></div>' : ''}
      </div>
    `;
    galleryGrid.appendChild(card);

    if (loggedIn) {
      const actionContainer = card.querySelector('.card-actions');
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'action-button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => startEditDesign(design.id));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'action-button secondary';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteDesign(design.id));

      actionContainer.append(editButton, deleteButton);
    }
  });
}

function showPreview(imageUrl) {
  if (!imageUrl) {
    previewContainer.classList.add('hidden');
    previewImage.src = '';
    return;
  }

  previewImage.src = imageUrl;
  previewContainer.classList.remove('hidden');
}

function isOwnerLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

function setOwnerLoggedIn(value) {
  localStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
  updateAuthUI();
}

function updateAuthUI() {
  const loggedIn = isOwnerLoggedIn();

  if (uploadSection) {
    uploadSection.classList.toggle('hidden', !loggedIn);
  }

  if (ownerUploadButton) {
    ownerUploadButton.classList.toggle('hidden', !loggedIn);
  }

  if (uploadNavLink) {
    uploadNavLink.classList.toggle('hidden', !loggedIn);
  }

  if (authButton) {
    authButton.textContent = loggedIn ? 'Logout' : 'Login';
  }

  if (loginSection) {
    loginSection.classList.toggle('hidden', loggedIn);
  }

  if (authStatus) {
    authStatus.textContent = '';
    authStatus.classList.remove('success', 'error');
  }
}

function resetLoginForm() {
  if (loginUsername) loginUsername.value = '';
  if (loginPassword) loginPassword.value = '';
  if (authStatus) {
    authStatus.textContent = '';
    authStatus.classList.remove('success', 'error');
  }
}

function resetDesignForm() {
  currentEditId = null;
  designForm.reset();
  showPreview(null);
}

function startEditDesign(id) {
  const designs = loadDesigns();
  const design = designs.find((item) => item.id === id);
  if (!design) return;

  if (uploadSection) uploadSection.classList.remove('hidden');
  if (ownerUploadButton) ownerUploadButton.classList.remove('hidden');
  if (uploadNavLink) uploadNavLink.classList.remove('hidden');
  if (loginSection) loginSection.classList.add('hidden');

  designTitle.value = design.title;
  designDescription.value = design.description;
  showPreview(design.image);
  currentEditId = id;
  uploadSection.scrollIntoView({ behavior: 'smooth' });
}

function deleteDesign(id) {
  const designs = loadDesigns().filter((item) => item.id !== id);
  saveDesigns(designs);
  renderGallery();
}

designImageInput.addEventListener('change', () => {
  const file = designImageInput.files?.[0];
  if (!file) {
    showPreview(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => showPreview(reader.result);
  reader.readAsDataURL(file);
});

designForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = designTitle.value.trim();
  const description = designDescription.value.trim();
  const file = designImageInput.files?.[0];

  if (!title || !description) {
    alert('Please add a title and a description for your design.');
    return;
  }

  const saveEntry = (imageData) => {
    const designs = loadDesigns();
    const imageValue = imageData !== null ? imageData : designs.find((item) => item.id === currentEditId)?.image || '';

    if (currentEditId) {
      const existingIndex = designs.findIndex((item) => item.id === currentEditId);
      if (existingIndex >= 0) {
        designs[existingIndex] = {
          ...designs[existingIndex],
          title,
          description,
          image: imageValue,
          updatedAt: new Date().toISOString(),
          owner: true,
        };
      }
    } else {
      designs.unshift({
        id: Date.now(),
        title,
        description,
        image: imageValue,
        createdAt: new Date().toISOString(),
        owner: true,
      });
    }

    saveDesigns(designs);
    renderGallery();
    resetDesignForm();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => saveEntry(reader.result);
    reader.readAsDataURL(file);
  } else {
    saveEntry(null);
  }
});

if (authButton) {
  authButton.addEventListener('click', () => {
    if (isOwnerLoggedIn()) {
      setOwnerLoggedIn(false);
      resetDesignForm();
      return;
    }

    if (loginSection) {
      resetLoginForm();
      loginSection.classList.remove('hidden');
      loginSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

if (ownerLoginForm) {
  ownerLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (authStatus) {
      authStatus.classList.remove('success', 'error');
      authStatus.textContent = '';
    }

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setOwnerLoggedIn(true);
      if (authStatus) {
        authStatus.textContent = 'Welcome back, Dhanshika!';
        authStatus.classList.add('success');
      }
      ownerLoginForm.reset();
      resetLoginForm();
      return;
    }

    if (authStatus) {
      authStatus.textContent = 'Invalid username or password. Please try again.';
      authStatus.classList.add('error');
    }
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = contactName.value.trim();
    const email = contactEmail.value.trim();
    const message = contactMessage.value.trim();

    contactStatus.classList.remove('success', 'error');
    contactStatus.textContent = '';

    if (!name || !email || !message) {
      contactStatus.textContent = 'Please fill in all contact details.';
      contactStatus.classList.add('error');
      return;
    }

    contactSubmit.disabled = true;
    contactStatus.textContent = 'Sending message...';

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to send message');
      }

      contactStatus.textContent = 'Message sent! I will reply soon.';
      contactStatus.classList.add('success');
      contactForm.reset();
    } catch (error) {
      contactStatus.textContent = 'Sorry, message could not be sent. Please try again later.';
      contactStatus.classList.add('error');
      console.error(error);
    } finally {
      contactSubmit.disabled = false;
    }
  });
}

updateAuthUI();
renderGallery();
