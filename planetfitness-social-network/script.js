// Función para dar like a foto en modal
function likePhoto() {
  const likeBtn = document.querySelector('#photoModal .btn-outline');
  const icon = likeBtn.querySelector('i');
  const likesSpan = document.getElementById('modalLikes');
  let currentLikes = parseInt(likesSpan.textContent);
  
  if (icon.classList.contains('far')) {
    icon.classList.remove('far');
    icon.classList.add('fas');
    likeBtn.style.color = 'var(--danger)';
    likesSpan.textContent = currentLikes + 1;
    showToast('¡Te gustó esta foto!', 'success');
  } else {
    icon.classList.remove('fas');
    icon.classList.add('far');
    likeBtn.style.color = '';
    likesSpan.textContent = currentLikes - 1;
  }
}

// Función para eliminar foto
function deletePhoto(photoId) {
  // Confirmar eliminación
  if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
    // Encontrar el índice de la foto
    const photoIndex = profilePhotos.findIndex(photo => photo.id === photoId);
    
    if (photoIndex > -1) {
      // Si la foto tiene una URL de objeto (archivo local), liberarla
      const photo = profilePhotos[photoIndex];
      if (photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
      
      // Eliminar foto del array
      profilePhotos.splice(photoIndex, 1);
      
      // Recargar la grilla
      loadProfilePhotos();
      
      // Cerrar modal si está abierto
      closePhotoModal();
      
      showToast('Foto eliminada correctamente', 'success');
    }
  }
}

// Función para eliminar múltiples fotos
function deleteMultiplePhotos(photoIds) {
  if (photoIds.length === 0) {
    showToast('No hay fotos seleccionadas', 'info');
    return;
  }
  
  const count = photoIds.length;
  const message = count === 1 ? '¿Eliminar esta foto?' : `¿Eliminar ${count} fotos seleccionadas?`;
  
  if (confirm(message)) {
    // Eliminar fotos en orden inverso para mantener índices correctos
    photoIds.sort((a, b) => b - a).forEach(photoId => {
      const photoIndex = profilePhotos.findIndex(photo => photo.id === photoId);
      if (photoIndex > -1) {
        const photo = profilePhotos[photoIndex];
        if (photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url);
        }
        profilePhotos.splice(photoIndex, 1);
      }
    });
    
    loadProfilePhotos();
    exitSelectionMode();
    showToast(`${count} foto${count > 1 ? 's' : ''} eliminada${count > 1 ? 's' : ''}`, 'success');
  }
}


// Función para entrar en modo de selección múltiple
function enterSelectionMode() {
  isSelectionMode = true;
  selectedPhotos = [];
  
  // Cambiar el botón de agregar por botones de selección
  const uploadBtn = document.getElementById('uploadPhotoBtn');
  if (uploadBtn) {
    uploadBtn.style.display = 'none';
  }
  
  // Crear barra de herramientas de selección
  const profileContent = document.querySelector('.profile-content');
  const selectionToolbar = document.createElement('div');
  selectionToolbar.id = 'selectionToolbar';
  selectionToolbar.style.cssText = `
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    align-items: center;
  `;
  
  selectionToolbar.innerHTML = `
    <span id="selectionCount">0 fotos seleccionadas</span>
    <button class="btn-outline" onclick="selectAllPhotos()">Seleccionar todas</button>
    <button class="btn-primary" onclick="deleteMultiplePhotos(selectedPhotos)" style="background: var(--danger);">
      <i class="fas fa-trash"></i> Eliminar
    </button>
    <button class="btn-outline" onclick="exitSelectionMode()">Cancelar</button>
  `;
  
  profileContent.insertBefore(selectionToolbar, profileContent.firstChild);
  
  // Recargar fotos en modo selección
  loadProfilePhotosWithSelection();
}

// Función para salir del modo de selección
function exitSelectionMode() {
  isSelectionMode = false;
  selectedPhotos = [];
  
  // Remover barra de herramientas
  const toolbar = document.getElementById('selectionToolbar');
  if (toolbar) {
    toolbar.remove();
  }
  
  // Mostrar botón de agregar
  const uploadBtn = document.getElementById('uploadPhotoBtn');
  if (uploadBtn) {
    uploadBtn.style.display = 'flex';
  }
  
  // Recargar fotos normalmente
  loadProfilePhotos();
}

// Función para seleccionar/deseleccionar foto
function togglePhotoSelection(photoId) {
  const index = selectedPhotos.indexOf(photoId);
  if (index > -1) {
    selectedPhotos.splice(index, 1);
  } else {
    selectedPhotos.push(photoId);
  }
  
  updateSelectionUI();
}

// Función para seleccionar todas las fotos
function selectAllPhotos() {
  selectedPhotos = profilePhotos.map(photo => photo.id);
  loadProfilePhotosWithSelection();
  updateSelectionUI();
}

// Función para actualizar UI de selección
function updateSelectionUI() {
  const count = selectedPhotos.length;
  const countElement = document.getElementById('selectionCount');
  if (countElement) {
    countElement.textContent = `${count} foto${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`;
  }
  
  // Actualizar checkboxes
  selectedPhotos.forEach(photoId => {
    const checkbox = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }
  });
}

// Función para cargar fotos con modo de selección
function loadProfilePhotosWithSelection() {
  const postsGrid = document.querySelector('.posts-grid');
  
  if (!postsGrid) return;
  
  postsGrid.innerHTML = '';
  
  profilePhotos.forEach(photo => {
    const photoElement = document.createElement('div');
    photoElement.className = 'post-thumbnail';
    photoElement.style.position = 'relative';
    
    const isSelected = selectedPhotos.includes(photo.id);
    
    photoElement.innerHTML = `
      <img src="${photo.url}" alt="${photo.alt}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius); ${isSelected ? 'opacity: 0.7; border: 3px solid var(--purple-primary);' : ''}">
      <div class="selection-checkbox" style="position: absolute; top: 10px; right: 10px; z-index: 10;">
        <input type="checkbox" data-photo-id="${photo.id}" onchange="togglePhotoSelection(${photo.id})" ${isSelected ? 'checked' : ''} 
               style="transform: scale(1.5); accent-color: var(--purple-primary);">
      </div>
      <div class="post-stats-overlay" style="pointer-events: none;">
        <span><i class="fas fa-heart"></i> ${photo.likes}</span>
        <span><i class="fas fa-comment"></i> ${photo.comments}</span>
      </div>
    `;
    
    // Agregar click para seleccionar en modo selección
    photoElement.onclick = () => {
      if (isSelectionMode) {
        togglePhotoSelection(photo.id);
        loadProfilePhotosWithSelection();
      } else {
        openPhotoModal(photo);
      }
    };
    
    postsGrid.appendChild(photoElement);
  });
}// script.js - GymConnect Social Network - VERSIÓN COMPLETA

// Estado de la aplicación
let appState = {
    currentSection: 'home',
    isNotificationsOpen: false,
    isCreatePostModalOpen: false,
    posts: [],
    routines: [],
    exercises: [],
    notifications: [
      {
        id: 1,
        user: 'María García',
        action: 'le gustó tu publicación',
        time: 'hace 2 min',
        read: false
      },
      {
        id: 2,
        user: 'Carlos López',
        action: 'comentó en tu rutina',
        time: 'hace 15 min',
        read: false
      },
      {
        id: 3,
        user: 'Ana Ruiz',
        action: 'empezó a seguirte',
        time: 'hace 1 hora',
        read: true
      }
    ]
  };

// Array de fotos de ejemplo para el perfil
const profilePhotos = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    alt: 'Entrenamiento con pesas',
    likes: 45,
    comments: 12,
    type: 'image'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=400&fit=crop',
    alt: 'Sesión de cardio',
    likes: 89,
    comments: 23,
    type: 'image'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop',
    alt: 'Rutina de espalda',
    likes: 67,
    comments: 15,
    type: 'image'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
    alt: 'Entrenamiento funcional',
    likes: 78,
    comments: 18,
    type: 'image'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop',
    alt: 'Sesión de piernas',
    likes: 92,
    comments: 25,
    type: 'image'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=400&fit=crop',
    alt: 'Yoga y flexibilidad',
    likes: 56,
    comments: 9,
    type: 'image'
  }
];
  
  // Inicialización de la aplicación
  document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
  });
  
  function initializeApp() {
    setupNavigation();
    setupEventListeners();
    loadInitialData();
    updateNotificationBadge();
  }
  
  // Configuración de navegación
  function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetSection = this.getAttribute('data-section');
        navigateToSection(targetSection);
      });
    });
  }
  
  function navigateToSection(sectionName) {
    // Actualizar estado
    appState.currentSection = sectionName;
    
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('active');
    }
    
    // Actualizar navegación activa
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Cargar fotos si es el perfil
    if (sectionName === 'profile') {
      setTimeout(() => {
        loadProfilePhotos();
        addUploadButton();
      }, 100);
    }
    
    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Configuración de event listeners
  function setupEventListeners() {
    // Clicks fuera de dropdowns para cerrarlos
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.notifications-dropdown') && !e.target.closest('[onclick="toggleNotifications()"]')) {
        closeNotifications();
      }
      
      if (!e.target.closest('.modal-content') && e.target.classList.contains('modal')) {
        closeCreatePost();
        closePhotoModal();
      }
    });
    
    // Tecla ESC para cerrar modales
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeCreatePost();
        closeNotifications();
        closePhotoModal();
      }
    });
    
    // Event listeners para tabs
    setupTabListeners();
    
    // Event listeners para filtros
    setupFilterListeners();
    
    // Event listeners para botones de acción en posts
    setupPostActionListeners();
  }
  
  // Configuración de tabs
  function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const parentContainer = this.closest('.filter-tabs, .profile-tabs, .exercise-categories');
        if (parentContainer) {
          // Remover active de todos los tabs del mismo contenedor
          parentContainer.querySelectorAll('.tab-btn, .category-btn').forEach(tab => {
            tab.classList.remove('active');
          });
          // Agregar active al tab clickeado
          this.classList.add('active');
          
          // Aquí podrías agregar lógica específica según el tipo de tab
          handleTabChange(this);
        }
      });
    });
  }
  
  // Manejar cambios de tab
  function handleTabChange(tabElement) {
    const tabText = tabElement.textContent;
    const section = appState.currentSection;
    
    console.log(`Cambiando a tab: ${tabText} en sección: ${section}`);
    
    // Aquí podrías filtrar contenido según el tab seleccionado
    if (section === 'routines') {
      filterRoutines(tabText);
    } else if (section === 'exercises') {
      filterExercises(tabText);
    }
  }
  
  // Filtrar rutinas
  function filterRoutines(filter) {
    console.log(`Filtrando rutinas por: ${filter}`);
    // Aquí implementarías la lógica de filtrado real
    // Por ahora solo mostramos un mensaje en consola
  }
  
  // Filtrar ejercicios
  function filterExercises(filter) {
    console.log(`Filtrando ejercicios por: ${filter}`);
    // Aquí implementarías la lógica de filtrado real
  }
  
  // Configuración de filtros
  function setupFilterListeners() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
      button.addEventListener('click', function() {
        const parentContainer = this.closest('.exercise-categories');
        if (parentContainer) {
          parentContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
          });
          this.classList.add('active');
          
          filterExercises(this.textContent);
        }
      });
    });
  }
  
  // Configuración de acciones en posts
  function setupPostActionListeners() {
    // Like buttons
    document.querySelectorAll('.action-btn').forEach(button => {
      if (button.textContent.includes('Like')) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          handleLike(this);
        });
      }
      
      if (button.textContent.includes('Comentar')) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          handleComment(this);
        });
      }
      
      if (button.textContent.includes('Compartir')) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          handleShare(this);
        });
      }
    });
  }
  
  // Manejar like
  function handleLike(button) {
    const icon = button.querySelector('i');
    const text = button.querySelector('span') || button;
    
    if (icon.classList.contains('far')) {
      // No liked -> liked
      icon.classList.remove('far');
      icon.classList.add('fas');
      button.style.color = '#DC3545';
      showToast('¡Te gustó esta publicación!', 'success');
    } else {
      // Liked -> no liked
      icon.classList.remove('fas');
      icon.classList.add('far');
      button.style.color = '';
    }
    
    // Animación
    button.style.transform = 'scale(1.1)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  }
  
  // Manejar comentario
  function handleComment(button) {
    showToast('Función de comentarios próximamente', 'info');
  }
  
  // Manejar compartir
  function handleShare(button) {
    showToast('Publicación compartida', 'success');
  }
  
  // Toggle notificaciones
  function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    
    if (appState.isNotificationsOpen) {
      closeNotifications();
    } else {
      openNotifications();
    }
  }
  
  function openNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.add('show');
    appState.isNotificationsOpen = true;
  }
  
  function closeNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.remove('show');
    appState.isNotificationsOpen = false;
  }
  
  // Modal de crear post
  function openCreatePost() {
    const modal = document.getElementById('createPostModal');
    modal.classList.add('show');
    appState.isCreatePostModalOpen = true;
    
    // Enfocar el textarea
    setTimeout(() => {
      const textarea = modal.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }
  
  function closeCreatePost() {
    const modal = document.getElementById('createPostModal');
    modal.classList.remove('show');
    appState.isCreatePostModalOpen = false;
    
    // Limpiar el textarea
    const textarea = modal.querySelector('textarea');
    if (textarea) {
      textarea.value = '';
    }
  }

// NUEVAS FUNCIONES PARA FOTOS DEL PERFIL

// Función para cargar fotos reales en el perfil
function loadProfilePhotos() {
  const postsGrid = document.querySelector('.posts-grid');
  
  if (!postsGrid) return;
  
  // Limpiar contenido existente
  postsGrid.innerHTML = '';
  
  // Agregar cada foto
  profilePhotos.forEach(photo => {
    const photoElement = document.createElement('div');
    photoElement.className = 'post-thumbnail';
    photoElement.onclick = () => openPhotoModal(photo);
    
    photoElement.innerHTML = `
      <img src="${photo.url}" alt="${photo.alt}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius);">
      <div class="post-stats-overlay">
        <span><i class="fas fa-heart"></i> ${photo.likes}</span>
        <span><i class="fas fa-comment"></i> ${photo.comments}</span>
        <button class="delete-photo-btn" onclick="event.stopPropagation(); deletePhoto(${photo.id})" title="Eliminar foto">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    postsGrid.appendChild(photoElement);
  });
}

// Función para abrir modal de foto
function openPhotoModal(photo) {
  // Crear modal si no existe
  let photoModal = document.getElementById('photoModal');
  
  if (!photoModal) {
    photoModal = document.createElement('div');
    photoModal.id = 'photoModal';
    photoModal.className = 'modal';
    photoModal.innerHTML = `
      <div class="modal-content photo-modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3>Publicación</h3>
          <button class="close-btn" onclick="closePhotoModal()">&times;</button>
        </div>
        <div class="modal-body">
          <img id="modalPhoto" src="" alt="" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
          <div class="photo-stats" style="display: flex; gap: 20px; margin-bottom: 15px; font-size: 14px; color: var(--gray-dark);">
            <span><i class="fas fa-heart" style="color: var(--danger);"></i> <span id="modalLikes">0</span> likes</span>
            <span><i class="fas fa-comment"></i> <span id="modalComments">0</span> comentarios</span>
          </div>
          <p id="modalCaption" style="margin-top: 15px; color: var(--black); line-height: 1.6;"></p>
          <div class="modal-actions" style="display: flex; gap: 15px; margin-top: 20px; justify-content: center;">
            <button class="btn-outline" onclick="likePhoto()">
              <i class="far fa-heart"></i> Me gusta
            </button>
            <button class="btn-outline" onclick="showToast('Función de comentarios próximamente', 'info')">
              <i class="far fa-comment"></i> Comentar
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(photoModal);
  }
  
  // Actualizar contenido del modal
  document.getElementById('modalPhoto').src = photo.url;
  document.getElementById('modalPhoto').alt = photo.alt;
  document.getElementById('modalLikes').textContent = photo.likes;
  document.getElementById('modalComments').textContent = photo.comments;
  document.getElementById('modalCaption').textContent = photo.alt;
  
  // Mostrar modal
  photoModal.classList.add('show');
}

// Función para cerrar modal de foto
function closePhotoModal() {
  const photoModal = document.getElementById('photoModal');
  if (photoModal) {
    photoModal.classList.remove('show');
  }
}

// Función para eliminar foto
function deletePhoto(photoId) {
  // Confirmar eliminación
  if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
    // Encontrar el índice de la foto
    const photoIndex = profilePhotos.findIndex(photo => photo.id === photoId);
    
    if (photoIndex > -1) {
      // Si la foto tiene una URL de objeto (archivo local), liberarla
      const photo = profilePhotos[photoIndex];
      if (photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
      
      // Eliminar foto del array
      profilePhotos.splice(photoIndex, 1);
      
      // Recargar la grilla
      loadProfilePhotos();
      
      // Cerrar modal si está abierto
      closePhotoModal();
      
      showToast('Foto eliminada correctamente', 'success');
    }
  }
}

// Función para eliminar múltiples fotos
function deleteMultiplePhotos(photoIds) {
  if (photoIds.length === 0) {
    showToast('No hay fotos seleccionadas', 'info');
    return;
  }
  
  const count = photoIds.length;
  const message = count === 1 ? '¿Eliminar esta foto?' : `¿Eliminar ${count} fotos seleccionadas?`;
  
  if (confirm(message)) {
    // Eliminar fotos en orden inverso para mantener índices correctos
    photoIds.sort((a, b) => b - a).forEach(photoId => {
      const photoIndex = profilePhotos.findIndex(photo => photo.id === photoId);
      if (photoIndex > -1) {
        const photo = profilePhotos[photoIndex];
        if (photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url);
        }
        profilePhotos.splice(photoIndex, 1);
      }
    });
    
    loadProfilePhotos();
    exitSelectionMode();
    showToast(`${count} foto${count > 1 ? 's' : ''} eliminada${count > 1 ? 's' : ''}`, 'success');
  }
}

// Variables para modo de selección
let isSelectionMode = false;
let selectedPhotos = [];

// Función para entrar en modo de selección múltiple
function enterSelectionMode() {
  isSelectionMode = true;
  selectedPhotos = [];
  
  // Cambiar el botón de agregar por botones de selección
  const uploadBtn = document.getElementById('uploadPhotoBtn');
  if (uploadBtn) {
    uploadBtn.style.display = 'none';
  }
  
  // Crear barra de herramientas de selección
  const profileContent = document.querySelector('.profile-content');
  const selectionToolbar = document.createElement('div');
  selectionToolbar.id = 'selectionToolbar';
  selectionToolbar.style.cssText = `
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    align-items: center;
  `;
  
  selectionToolbar.innerHTML = `
    <span id="selectionCount">0 fotos seleccionadas</span>
    <button class="btn-outline" onclick="selectAllPhotos()">Seleccionar todas</button>
    <button class="btn-primary" onclick="deleteMultiplePhotos(selectedPhotos)" style="background: var(--danger);">
      <i class="fas fa-trash"></i> Eliminar
    </button>
    <button class="btn-outline" onclick="exitSelectionMode()">Cancelar</button>
  `;
  
  profileContent.insertBefore(selectionToolbar, profileContent.firstChild);
  
  // Recargar fotos en modo selección
  loadProfilePhotosWithSelection();
}

// Función para salir del modo de selección
function exitSelectionMode() {
  isSelectionMode = false;
  selectedPhotos = [];
  
  // Remover barra de herramientas
  const toolbar = document.getElementById('selectionToolbar');
  if (toolbar) {
    toolbar.remove();
  }
  
  // Mostrar botón de agregar
  const uploadBtn = document.getElementById('uploadPhotoBtn');
  if (uploadBtn) {
    uploadBtn.style.display = 'flex';
  }
  
  // Recargar fotos normalmente
  loadProfilePhotos();
}

// Función para seleccionar/deseleccionar foto
function togglePhotoSelection(photoId) {
  const index = selectedPhotos.indexOf(photoId);
  if (index > -1) {
    selectedPhotos.splice(index, 1);
  } else {
    selectedPhotos.push(photoId);
  }
  
  updateSelectionUI();
}

// Función para seleccionar todas las fotos
function selectAllPhotos() {
  selectedPhotos = profilePhotos.map(photo => photo.id);
  loadProfilePhotosWithSelection();
  updateSelectionUI();
}

// Función para actualizar UI de selección
function updateSelectionUI() {
  const count = selectedPhotos.length;
  const countElement = document.getElementById('selectionCount');
  if (countElement) {
    countElement.textContent = `${count} foto${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`;
  }
  
  // Actualizar checkboxes
  selectedPhotos.forEach(photoId => {
    const checkbox = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }
  });
}

// Función para cargar fotos con modo de selección
function loadProfilePhotosWithSelection() {
  const postsGrid = document.querySelector('.posts-grid');
  
  if (!postsGrid) return;
  
  postsGrid.innerHTML = '';
  
  profilePhotos.forEach(photo => {
    const photoElement = document.createElement('div');
    photoElement.className = 'post-thumbnail';
    photoElement.style.position = 'relative';
    
    const isSelected = selectedPhotos.includes(photo.id);
    
    photoElement.innerHTML = `
      <img src="${photo.url}" alt="${photo.alt}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius); ${isSelected ? 'opacity: 0.7; border: 3px solid var(--purple-primary);' : ''}">
      <div class="selection-checkbox" style="position: absolute; top: 10px; right: 10px; z-index: 10;">
        <input type="checkbox" data-photo-id="${photo.id}" onchange="togglePhotoSelection(${photo.id})" ${isSelected ? 'checked' : ''} 
               style="transform: scale(1.5); accent-color: var(--purple-primary);">
      </div>
      <div class="post-stats-overlay" style="pointer-events: none;">
        <span><i class="fas fa-heart"></i> ${photo.likes}</span>
        <span><i class="fas fa-comment"></i> ${photo.comments}</span>
      </div>
    `;
    
    // Agregar click para seleccionar en modo selección
    photoElement.onclick = () => {
      if (isSelectionMode) {
        togglePhotoSelection(photo.id);
        loadProfilePhotosWithSelection();
      } else {
        openPhotoModal(photo);
      }
    };
    
    postsGrid.appendChild(photoElement);
  });
}

// Función para subir nueva foto (simulada)
function uploadNewPhoto() {
  // Crear input file invisible
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño de archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('El archivo es muy grande. Máximo 5MB.', 'error');
        return;
      }
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showToast('Solo se permiten archivos de imagen.', 'error');
        return;
      }
      
      // Crear nueva foto
      const newPhoto = {
        id: profilePhotos.length + 1,
        url: URL.createObjectURL(file), // Esto crea una URL temporal del archivo
        alt: `Nueva foto - ${file.name.replace(/\.[^/.]+$/, "")}`,
        likes: 0,
        comments: 0,
        type: 'image'
      };
      
      profilePhotos.unshift(newPhoto); // Agregar al inicio
      loadProfilePhotos(); // Recargar la grilla
      showToast('Foto subida exitosamente', 'success');
    }
  };
  
  input.click();
}

// Agregar botón de subir foto al perfil
function addUploadButton() {
  const profileContent = document.querySelector('.profile-content');
  
  if (profileContent && !document.getElementById('uploadPhotoBtn')) {
    // Contenedor para botones
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    `;
    
    // Botón agregar foto
    const uploadBtn = document.createElement('button');
    uploadBtn.id = 'uploadPhotoBtn';
    uploadBtn.className = 'btn-primary';
    uploadBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar Foto';
    uploadBtn.onclick = uploadNewPhoto;
    
    // Botón seleccionar múltiples
    const selectBtn = document.createElement('button');
    selectBtn.className = 'btn-outline';
    selectBtn.innerHTML = '<i class="fas fa-check-square"></i> Seleccionar';
    selectBtn.onclick = enterSelectionMode;
    
    buttonContainer.appendChild(uploadBtn);
    buttonContainer.appendChild(selectBtn);
    profileContent.insertBefore(buttonContainer, profileContent.firstChild);
  }
}
  
  // Actualizar badge de notificaciones
  function updateNotificationBadge() {
    const unreadCount = appState.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
  }
  
  // Cargar datos iniciales
  function loadInitialData() {
    // Aquí cargarías datos desde una API o base de datos
    // Por ahora usamos datos de ejemplo
    
    appState.posts = [
      {
        id: 1,
        user: 'María García',
        username: '@mariafit',
        time: 'hace 2 horas',
        content: '¡Terminé mi primera sesión de deadlifts con 100kg! 💪 Gracias a todos por el apoyo y los consejos. #DeadliftProgress #Fuerza',
        likes: 45,
        comments: 12,
        shares: 8,
        hasImage: true
      },
      {
        id: 2,
        user: 'Carlos López',
        username: '@carloscoach',
        time: 'hace 4 horas',
        content: 'Rutina de pecho completa para principiantes 📋 Guarda este post para después!',
        likes: 89,
        comments: 23,
        shares: 34,
        hasRoutine: true,
        routine: {
          name: 'Pecho Principiante',
          exercises: [
            { name: 'Press de banca', reps: '3x8-10' },
            { name: 'Flexiones', reps: '3x12-15' },
            { name: 'Aperturas con mancuernas', reps: '3x10-12' }
          ]
        }
      }
    ];
    
    console.log('Datos iniciales cargados');
  }
  
  // Sistema de toast/notificaciones
  function showToast(message, type = 'info') {
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.getElementById('toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        .toast {
          position: fixed;
          top: 100px;
          right: 20px;
          background: white;
          padding: 15px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 3000;
          animation: toastSlideIn 0.3s ease;
          border-left: 4px solid var(--purple-primary);
        }
        
        .toast-success {
          border-left-color: var(--success);
        }
        
        .toast-info {
          border-left-color: var(--info);
        }
        
        .toast-error {
          border-left-color: var(--danger);
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--black);
          font-weight: 500;
        }
        
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes toastSlideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    // Agregar al DOM
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  function getToastIcon(type) {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'exclamation-circle';
      case 'info': return 'info-circle';
      default: return 'info-circle';
    }
  }
  
  // Funciones de utilidad
  function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `hace ${days} día${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  }
  
  // Funciones para seguir usuarios
  function followUser(button, username) {
    const isFollowing = button.textContent.includes('Siguiendo');
    
    if (isFollowing) {
      button.textContent = 'Seguir';
      button.style.background = 'var(--yellow-primary)';
      button.style.color = 'var(--black)';
      showToast(`Dejaste de seguir a ${username}`, 'info');
    } else {
      button.textContent = 'Siguiendo';
      button.style.background = 'var(--gray-dark)';
      button.style.color = 'var(--white)';
      showToast(`Ahora sigues a ${username}`, 'success');
    }
  }
  
  // Buscar ejercicios
  function searchExercises(query) {
    console.log(`Buscando ejercicios: ${query}`);
    // Aquí implementarías la búsqueda real
    showToast(`Buscando: "${query}"`, 'info');
  }
  
  // Event listener para búsqueda
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          if (e.target.value.trim()) {
            searchExercises(e.target.value.trim());
          }
        }, 500);
      });
    }

    // Cargar fotos si ya estamos en el perfil al inicializar
    setTimeout(() => {
      if (appState.currentSection === 'profile') {
        loadProfilePhotos();
        addUploadButton();
      }
    }, 500);
  });
  
  // Funciones para rutinas
  function viewRoutine(routineId) {
    showToast('Abriendo rutina...', 'info');
    // Aquí navegarías a la vista detallada de la rutina
  }
  
  function saveRoutine(routineId) {
    showToast('Rutina guardada en tus favoritos', 'success');
  }
  
  // Funciones para ejercicios
  function viewExercise(exerciseId) {
    showToast('Abriendo ejercicio...', 'info');
    // Aquí navegarías a la vista detallada del ejercicio
  }
  
  // Animaciones adicionales
  function addHoverEffects() {
    // Efecto hover para cards
    const cards = document.querySelectorAll('.post-card, .routine-card-large, .exercise-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.transition = 'all 0.3s ease';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  }
  
  // Lazy loading para imágenes (simulado)
  function setupLazyLoading() {
    const placeholders = document.querySelectorAll('.placeholder-image');
    placeholders.forEach(placeholder => {
      // Simular carga de imagen después de un delay
      setTimeout(() => {
        placeholder.style.background = 'linear-gradient(135deg, var(--purple-primary), var(--yellow-primary))';
        placeholder.innerHTML = '<i class="fas fa-image" style="font-size: 24px; color: white;"></i>';
      }, Math.random() * 2000 + 1000);
    });
  }
  
  // Inicializar efectos adicionales después de cargar la página
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      addHoverEffects();
      setupLazyLoading();
    }, 500);
  });
  
  // Funciones para el perfil
  function editProfile() {
    showToast('Función de editar perfil próximamente', 'info');
  }
  
  // Funciones para eventos
  function joinEvent(eventId) {
    showToast('Te has unido al evento', 'success');
  }
  
  // Sistema de preferencias (simulado)
  const userPreferences = {
    theme: 'light',
    notifications: true,
    autoplay: false
  };
  
  function togglePreference(pref) {
    userPreferences[pref] = !userPreferences[pref];
    showToast(`${pref} ${userPreferences[pref] ? 'activado' : 'desactivado'}`, 'info');
  }
  
  // Funciones de desarrollo/debug
  function logAppState() {
    console.log('Estado actual de la aplicación:', appState);
  }
  
  // Agregar al objeto window para acceso global en desarrollo
  window.gymConnectDebug = {
    appState,
    logAppState,
    showToast,
    navigateToSection,
    loadProfilePhotos,
    profilePhotos
  };
  
  console.log('GymConnect inicializado correctamente ✅');
