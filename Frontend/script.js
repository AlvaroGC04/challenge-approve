const API_BASE_URL = 'http://localhost:3000';

// DOM elements
const requestForm = document.getElementById('request-form');
const formMessage = document.getElementById('form-message');
const requestsContainer = document.getElementById('requests-container');
const requestDetailSection = document.getElementById('request-detail');
const detailContent = document.getElementById('detail-content');
const backToListBtn = document.getElementById('back-to-list');
const requestListSection = document.getElementById('request-list');
const createRequestSection = document.getElementById('create-request');


// fetch and show requests
async function fetchRequests() {
    requestsContainer.innerHTML = '<p>Cargando solicitudes...</p>'; // loading message
    try {
        const response = await fetch(`${API_BASE_URL}/requests`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const requests = await response.json();
        
        displayRequests(requests);
    } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
        requestsContainer.innerHTML = '<p style="color: red;">Error al cargar las solicitudes. Intente de nuevo más tarde.</p>';
    }
}

// Show container requests
function displayRequests(requests) {
    if (requests.length === 0) {
        requestsContainer.innerHTML = '<p>No hay solicitudes pendientes.</p>';
        return;
    }

    requestsContainer.innerHTML = ''; //container cls

    requests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.classList.add('request-item');
        requestItem.innerHTML = `
            <div>
                <h3>${request.title}</h3>
                <p>Solicitante: ${request.requester}</p>
                <p>Estado: <strong>${request.status.toUpperCase()}</strong></p>
            </div>
            <button data-id="${request.id}" class="btn-primary">Ver Detalles</button>
        `;
        requestsContainer.appendChild(requestItem);

        // add button "Ver Detalles"
        requestItem.querySelector('button').addEventListener('click', () => {
            fetchRequestById(request.id);
        });
    });
}

// Gather and show request details function
async function fetchRequestById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/requests/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const request = await response.json();
        displayRequestDetails(request);
    } catch (error) {
        console.error(`Error al obtener detalles de la solicitud ${id}:`, error);
        detailContent.innerHTML = '<p style="color: red;">Error al cargar los detalles de la solicitud.</p>';
    }
}

// Shows requests and handle approves and rejects 
function displayRequestDetails(request) {
    // Ocultar la lista y el formulario de creación, mostrar la sección de detalles
    requestListSection.style.display = 'none';
    createRequestSection.style.display = 'none';
    requestDetailSection.style.display = 'block';

    detailContent.innerHTML = `
        <p><strong>ID:</strong> ${request.id}</p>
        <p><strong>Título:</strong> ${request.title}</p>
        <p><strong>Descripción:</strong> ${request.description}</p>
        <p><strong>Solicitante:</strong> ${request.requester}</p>
        <p><strong>Aprobador:</strong> ${request.approver}</p>
        <p><strong>Tipo de Solicitud:</strong> ${request.request_type}</p>
        <p><strong>Estado:</strong> <strong style="color: ${request.status === 'approved' ? 'green' : request.status === 'rejected' ? 'red' : 'orange'};">${request.status.toUpperCase()}</strong></p>
        <p><strong>Creada el:</strong> ${new Date(request.created_at).toLocaleString()}</p>
        <p><strong>Última Actualización:</strong> ${new Date(request.updated_at).toLocaleString()}</p>
        <p><strong>Comentarios:</strong> ${request.comments || 'N/A'}</p>
        
        ${request.status === 'pending' ? `
            <h3>Acción del Aprobador</h3>
            <textarea id="approver-comments" placeholder="Deja un comentario (opcional)"></textarea><br>
            <button id="approve-btn" data-id="${request.id}" class="btn-primary">Aprobar</button>
            <button id="reject-btn" data-id="${request.id}" class="btn-danger">Rechazar</button>
        ` : ''}
    `;

    // listener for approve/reject button if pending
    if (request.status === 'pending') {
        const approveBtn = document.getElementById('approve-btn');
        const rejectBtn = document.getElementById('reject-btn');
        const approverComments = document.getElementById('approver-comments');

        approveBtn.addEventListener('click', () => {
            updateRequestStatus(request.id, 'approved', approverComments.value);
        });

        rejectBtn.addEventListener('click', () => {
            updateRequestStatus(request.id, 'rejected', approverComments.value);
        });
    }
}

// Update request function (Aprobar/Rechazar)
async function updateRequestStatus(id, status, comments) {
    try {
        const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, comment: comments }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);
        fetchRequests(); // reload requests
        showRequestList(); // back to the list
    } catch (error) {
        console.error(`Error al actualizar la solicitud ${id}:`, error);
        alert('Error al actualizar la solicitud. Consulte la consola para más detalles.');
    }
}


// Handle new request form submission.
requestForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // values can not be submitted if default

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const requester = document.getElementById('requester').value;
    const approver = document.getElementById('approver').value;
    const request_type = document.getElementById('request_type').value;

    try {
        const response = await fetch(`${API_BASE_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, requester, approver, request_type }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const newRequest = await response.json();
        formMessage.textContent = '¡Solicitud creada exitosamente!';
        formMessage.style.color = 'green';
        requestForm.reset();
        fetchRequests();
    } catch (error) {
        console.error('Error al crear la solicitud:', error);
        formMessage.textContent = `Error al crear la solicitud: ${error.message}`;
        formMessage.style.color = 'red';
    }
});


// Show/Hide details for request lists function
function showRequestList() {
    requestDetailSection.style.display = 'none';
    createRequestSection.style.display = 'block'; // Show from 
    requestListSection.style.display = 'block'; // Show request list
}


// 
backToListBtn.addEventListener('click', () => {
    showRequestList();
    fetchRequests(); //Refresh page
});


// Cargar las solicitudes al iniciar la página
document.addEventListener('DOMContentLoaded', fetchRequests);