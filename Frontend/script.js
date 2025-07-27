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

// References to the new DOM elements for the authorization logic.
const detailActingUserSelect = document.getElementById('detail-acting-user');
const approvalActionsDiv = document.getElementById('approval-actions');
const commentTextarea = document.getElementById('comment-text');
const approveButton = document.getElementById('approve-button');
const rejectButton = document.getElementById('reject-button');

let currentRequestDetails = null; // Stores the details of the current request.

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
        currentRequestDetails = request; // Stores the details for the authorization logic.
        displayRequestDetails(request);
    } catch (error) {
        console.error(`Error al obtener detalles de la solicitud ${id}:`, error);
        detailContent.innerHTML = '<p style="color: red;">Error al cargar los detalles de la solicitud.</p>';
        approvalActionsDiv.style.display = 'none'; // Hide actions if gets an error
    }
}

// Shows requests and handle approves and rejects 
function displayRequestDetails(request) {
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
    `;

    // Reset the user selector and the comment each time the details are displayed.
    detailActingUserSelect.value = '';
    commentTextarea.value = '';
    approvalActionsDiv.style.display = 'none'; // Hide default actions

    // listener for approve/reject button if pending.
    
    updateApprovalActionsUI(request);
}

// Function to update the visibility of the approve/reject buttons.
function updateApprovalActionsUI(request) {
    const selectedUser = detailActingUserSelect.value;
    // Simulated approvers have '_aprobador' in their name.
    const isApproverRole = selectedUser.includes('_aprobador'); 
    
    // Will only show actions if status is Pending
    // If the selected user is an approver and is the approver assigned to this request.
    if (request.status === 'pending' && isApproverRole && selectedUser === request.approver) {
        approvalActionsDiv.style.display = 'block';
    } else {
        approvalActionsDiv.style.display = 'none';
    }
}


// (Approve/Reject)
async function updateRequestStatus(id, status, comments) {
    const actingUser = detailActingUserSelect.value; // get the user designed for the action

    if (!actingUser) {
        alert('Por favor, selecciona tu usuario en el campo "Actuar como:" para realizar esta acción.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, comment: comments, acting_user: actingUser }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        alert(result.message);
        fetchRequests(); // reload requests
        showRequestList(); // back to the list
    } catch (error) {
        console.error(`Error al actualizar la solicitud ${id}:`, error);
        alert(`Error al actualizar la solicitud: ${error.message || 'Consulte la consola para más detalles.'}`);
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


backToListBtn.addEventListener('click', () => {
    showRequestList();
    fetchRequests(); //Refresh page
});


detailActingUserSelect.addEventListener('change', () => {
    if (currentRequestDetails) {
        updateApprovalActionsUI(currentRequestDetails);
    }
});

// Approval button listener
approveButton.addEventListener('click', () => {
    if (currentRequestDetails) {
        updateRequestStatus(currentRequestDetails.id, 'approved', commentTextarea.value);
    }
});

// Rejectcion button listener
rejectButton.addEventListener('click', () => {
    if (currentRequestDetails) {
        updateRequestStatus(currentRequestDetails.id, 'rejected', commentTextarea.value);
    }
});

// Load all request upon refreshing
document.addEventListener('DOMContentLoaded', fetchRequests);