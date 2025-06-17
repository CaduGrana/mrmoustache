// Global variables
let agendamentos = []
let visitCount = Number.parseInt(localStorage.getItem("visitCount")) || 1247
const currentDate = new Date()
let selectedDate = null
let currentAppointment = null

// WhatsApp API Configuration
let whatsappConfig = {
  accessToken: "",
  phoneNumberId: "",
  businessAccountId: "",
  autoSendEnabled: false,
}

// Automation Settings
let automationSettings = {
  autoConfirmation: true,
  autoReminder: true,
  reminderHours: 24,
  autoStatusUpdate: false,
}

// Message logs
let messageLogs = []

// WhatsApp Templates (simulated - in real implementation, these would come from API)
const whatsappTemplates = [
  {
    name: "agendamento_confirmacao",
    status: "approved",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Olá {{1}}! Seu agendamento na *Barbearia Corte Nobre* foi confirmado para {{2}} às {{3}} com {{4}}. Te esperamos!",
      },
    ],
  },
  {
    name: "lembrete_agendamento",
    status: "approved",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Oi {{1}}! Lembrete do seu agendamento hoje às {{2}} com {{3}} na Barbearia Corte Nobre. Te esperamos!",
      },
    ],
  },
]

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Load saved data
  loadSavedData()

  // Set up event listeners
  setupEventListeners()

  // Initialize components
  updateVisitCounter()
  generateCalendar()
  updateAppointmentsList()
  loadWhatsAppConfig()
  loadAutomationSettings()
  updateConnectionStatus()
  loadMessageTemplates()
  loadMessageLogs()

  // Set minimum date for date input
  const dateInput = document.getElementById("data")
  const today = new Date().toISOString().split("T")[0]
  dateInput.min = today

  // Start reminder scheduler
  startReminderScheduler()
}

function loadSavedData() {
  const savedAgendamentos = localStorage.getItem("agendamentos")
  if (savedAgendamentos) {
    agendamentos = JSON.parse(savedAgendamentos)
  }

  const savedWhatsAppConfig = localStorage.getItem("whatsappConfig")
  if (savedWhatsAppConfig) {
    whatsappConfig = JSON.parse(savedWhatsAppConfig)
  }

  const savedAutomationSettings = localStorage.getItem("automationSettings")
  if (savedAutomationSettings) {
    automationSettings = JSON.parse(savedAutomationSettings)
  }

  const savedMessageLogs = localStorage.getItem("messageLogs")
  if (savedMessageLogs) {
    messageLogs = JSON.parse(savedMessageLogs)
  }

  document.getElementById("visit-count").textContent = visitCount
}

function saveData() {
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos))
  localStorage.setItem("visitCount", visitCount.toString())
  localStorage.setItem("whatsappConfig", JSON.stringify(whatsappConfig))
  localStorage.setItem("automationSettings", JSON.stringify(automationSettings))
  localStorage.setItem("messageLogs", JSON.stringify(messageLogs))
}

function setupEventListeners() {
  // Tab navigation
  const navTabs = document.querySelectorAll(".nav-tab")
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab))
  })

  // Form submission
  const form = document.getElementById("agendamento-form")
  form.addEventListener("submit", handleFormSubmit)

  // WhatsApp config form
  const whatsappConfigForm = document.getElementById("whatsapp-config-form")
  whatsappConfigForm.addEventListener("submit", handleWhatsAppConfigSubmit)

  // Phone number formatting
  const phoneInput = document.getElementById("telefone")
  phoneInput.addEventListener("input", formatPhoneNumber)

  // Enable horario select when barbeiro and data are selected
  const barbeiroSelect = document.getElementById("barbeiro")
  const dataInput = document.getElementById("data")

  barbeiroSelect.addEventListener("change", updateHorarioOptions)
  dataInput.addEventListener("change", updateHorarioOptions)

  // Modal close on background click
  const modal = document.getElementById("whatsapp-modal")
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeWhatsAppModal()
    }
  })
}

function switchTab(tabName) {
  // Update nav tabs
  const navTabs = document.querySelectorAll(".nav-tab")
  navTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName)
  })

  // Update tab content
  const tabContents = document.querySelectorAll(".tab-content")
  tabContents.forEach((content) => {
    content.classList.toggle("active", content.id === tabName)
  })

  // Refresh content based on active tab
  if (tabName === "calendario") {
    generateCalendar()
    updateDailyAppointments()
  } else if (tabName === "gerenciar") {
    updateManageList()
  } else if (tabName === "whatsapp-config") {
    loadWhatsAppConfig()
    loadMessageLogs()
  }
}

function handleFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const agendamento = {
    id: Date.now().toString(),
    nomeCompleto: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    barbeiro: formData.get("barbeiro"),
    data: formData.get("data"),
    horario: formData.get("horario"),
    observacoes: formData.get("observacoes") || "",
    status: "agendado",
    timestamp: new Date().toISOString(),
    autoWhatsApp: formData.get("auto-whatsapp") === "on",
  }

  // Validate required fields
  if (
    !agendamento.nomeCompleto ||
    !agendamento.telefone ||
    !agendamento.email ||
    !agendamento.barbeiro ||
    !agendamento.data ||
    !agendamento.horario
  ) {
    showToast("Campos obrigatórios", "Por favor, preencha todos os campos obrigatórios.", "error")
    return
  }

  // Add to appointments list
  agendamentos.push(agendamento)

  // Update visit counter
  visitCount++
  updateVisitCounter()

  // Save data
  saveData()

  // Show success message
  const dataFormatada = new Date(agendamento.data).toLocaleDateString("pt-BR")
  showToast("Agendamento realizado!", `Horário agendado para ${dataFormatada} às ${agendamento.horario}`, "success")

  // Send automatic WhatsApp confirmation if enabled
  if (agendamento.autoWhatsApp && automationSettings.autoConfirmation && whatsappConfig.autoSendEnabled) {
    sendAutomaticWhatsAppMessage(agendamento, "confirmacao")
  }

  // Reset form
  e.target.reset()
  updateHorarioOptions()

  // Update other tabs
  updateAppointmentsList()
  updateManageList()
}

function handleWhatsAppConfigSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)

  whatsappConfig = {
    accessToken: formData.get("api-token"),
    phoneNumberId: formData.get("phone-number-id"),
    businessAccountId: formData.get("business-account-id"),
    autoSendEnabled: formData.get("auto-send-enabled") === "on",
  }

  saveData()
  updateConnectionStatus()

  showToast("Configuração salva!", "Configurações do WhatsApp API foram salvas com sucesso.", "success")
}

function testWhatsAppConnection() {
  if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
    showToast("Configuração incompleta", "Preencha o token de acesso e Phone Number ID primeiro.", "error")
    return
  }

  // Simulate API test (in real implementation, this would make an actual API call)
  showToast("Testando conexão...", "Verificando conectividade com WhatsApp API...", "warning")

  setTimeout(() => {
    // Simulate successful connection
    const success = Math.random() > 0.3 // 70% success rate for demo

    if (success) {
      showToast("Conexão bem-sucedida!", "WhatsApp API está funcionando corretamente.", "success")
      updateConnectionStatus(true)
    } else {
      showToast("Erro de conexão", "Não foi possível conectar com WhatsApp API. Verifique suas credenciais.", "error")
      updateConnectionStatus(false)
    }
  }, 2000)
}

function updateConnectionStatus(connected = null) {
  const statusElement = document.getElementById("connection-status")
  const statusIcon = statusElement.querySelector(".status-icon")
  const statusText = statusElement.querySelector(".status-text")

  if (connected === null) {
    // Determine status based on configuration
    connected = whatsappConfig.accessToken && whatsappConfig.phoneNumberId
  }

  if (connected) {
    statusElement.className = "connection-status connected"
    statusText.textContent = "Conectado e funcionando"
  } else if (whatsappConfig.accessToken || whatsappConfig.phoneNumberId) {
    statusElement.className = "connection-status error"
    statusText.textContent = "Erro de conexão"
  } else {
    statusElement.className = "connection-status"
    statusText.textContent = "Não configurado"
  }
}

function loadWhatsAppConfig() {
  if (whatsappConfig.accessToken) {
    document.getElementById("api-token").value = whatsappConfig.accessToken
  }
  if (whatsappConfig.phoneNumberId) {
    document.getElementById("phone-number-id").value = whatsappConfig.phoneNumberId
  }
  if (whatsappConfig.businessAccountId) {
    document.getElementById("business-account-id").value = whatsappConfig.businessAccountId
  }
  document.getElementById("auto-send-enabled").checked = whatsappConfig.autoSendEnabled
}

function loadAutomationSettings() {
  document.getElementById("auto-confirmation").checked = automationSettings.autoConfirmation
  document.getElementById("auto-reminder").checked = automationSettings.autoReminder
  document.getElementById("reminder-hours").value = automationSettings.reminderHours
  document.getElementById("auto-status-update").checked = automationSettings.autoStatusUpdate
}

function saveAutomationSettings() {
  automationSettings = {
    autoConfirmation: document.getElementById("auto-confirmation").checked,
    autoReminder: document.getElementById("auto-reminder").checked,
    reminderHours: Number.parseInt(document.getElementById("reminder-hours").value),
    autoStatusUpdate: document.getElementById("auto-status-update").checked,
  }

  saveData()
  showToast("Configurações salvas!", "Configurações de automação foram atualizadas.", "success")
}

function loadMessageTemplates() {
  const container = document.getElementById("message-templates")

  if (whatsappTemplates.length === 0) {
    container.innerHTML = '<p class="no-appointments">Nenhum template encontrado</p>'
    return
  }

  container.innerHTML = ""

  whatsappTemplates.forEach((template) => {
    const item = document.createElement("div")
    item.className = "template-item"

    item.innerHTML = `
      <div class="template-header">
        <div class="template-name">${template.name}</div>
        <div class="template-status status-${template.status}">${template.status}</div>
      </div>
      <div class="template-content">
        <small><strong>Categoria:</strong> ${template.category}</small><br>
        <small><strong>Idioma:</strong> ${template.language}</small>
      </div>
    `

    container.appendChild(item)
  })
}

function refreshTemplates() {
  showToast("Atualizando templates...", "Buscando templates aprovados do WhatsApp.", "warning")

  // Simulate API call to refresh templates
  setTimeout(() => {
    loadMessageTemplates()
    showToast("Templates atualizados!", "Lista de templates foi atualizada com sucesso.", "success")
  }, 1500)
}

function loadMessageLogs() {
  const container = document.getElementById("message-logs")
  const filter = document.getElementById("log-filter").value

  let filteredLogs = messageLogs
  if (filter !== "all") {
    filteredLogs = messageLogs.filter((log) => log.status === filter)
  }

  if (filteredLogs.length === 0) {
    container.innerHTML = '<p class="no-appointments">Nenhuma mensagem encontrada</p>'
    return
  }

  container.innerHTML = ""

  // Sort by timestamp (most recent first)
  filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  filteredLogs.forEach((log) => {
    const item = document.createElement("div")
    item.className = `log-item ${log.status}`

    const timestamp = new Date(log.timestamp).toLocaleString("pt-BR")

    item.innerHTML = `
      <div class="log-header">
        <div class="log-recipient">${log.recipient}</div>
        <div class="log-timestamp">${timestamp}</div>
      </div>
      <div class="log-message">${log.message.substring(0, 100)}${log.message.length > 100 ? "..." : ""}</div>
      <div class="log-status status-${log.status}">${log.status}</div>
      ${log.error ? `<div class="log-error"><small>Erro: ${log.error}</small></div>` : ""}
    `

    container.appendChild(item)
  })
}

function refreshMessageLogs() {
  loadMessageLogs()
  showToast("Logs atualizados!", "Lista de mensagens foi atualizada.", "success")
}

// WhatsApp API Functions
async function sendAutomaticWhatsAppMessage(appointment, messageType) {
  if (!whatsappConfig.autoSendEnabled || !whatsappConfig.accessToken) {
    return
  }

  const phoneNumber = appointment.telefone.replace(/\D/g, "")
  const message = generateWhatsAppMessage(appointment, messageType)

  // Log the message attempt
  const logEntry = {
    id: Date.now().toString(),
    recipient: appointment.nomeCompleto,
    phone: phoneNumber,
    message: message,
    type: messageType,
    status: "pending",
    timestamp: new Date().toISOString(),
  }

  messageLogs.push(logEntry)
  saveData()

  try {
    // Simulate API call (in real implementation, this would be actual WhatsApp Business API call)
    const success = await simulateWhatsAppAPICall(phoneNumber, message)

    if (success) {
      logEntry.status = "sent"
      showToast("Mensagem enviada!", `WhatsApp enviado para ${appointment.nomeCompleto}`, "success")
    } else {
      logEntry.status = "failed"
      logEntry.error = "Falha na API do WhatsApp"
      showToast("Erro no envio", `Não foi possível enviar WhatsApp para ${appointment.nomeCompleto}`, "error")
    }
  } catch (error) {
    logEntry.status = "failed"
    logEntry.error = error.message
    showToast("Erro no envio", `Erro ao enviar WhatsApp: ${error.message}`, "error")
  }

  saveData()
  loadMessageLogs()
}

async function simulateWhatsAppAPICall(phoneNumber, message) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Simulate 85% success rate
  return Math.random() > 0.15
}

function generateWhatsAppMessage(appointment, messageType) {
  const dataFormatada = new Date(appointment.data).toLocaleDateString("pt-BR")
  const nomeCliente = appointment.nomeCompleto.split(" ")[0]

  switch (messageType) {
    case "confirmacao":
      return `Olá ${nomeCliente}! 👋

Seu agendamento na *Barbearia Corte Nobre* foi confirmado! ✅

📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${appointment.horario}
✂️ *Barbeiro:* ${appointment.barbeiro}

Estamos te esperando! Se precisar reagendar, é só entrar em contato.

Obrigado pela preferência! 💈`

    case "lembrete":
      return `Oi ${nomeCliente}! 😊

Este é um lembrete do seu agendamento na *Barbearia Corte Nobre*:

📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${appointment.horario}
✂️ *Barbeiro:* ${appointment.barbeiro}

Te esperamos em breve! 💈

Se não puder comparecer, por favor nos avise com antecedência.`

    case "reagendamento":
      return `Olá ${nomeCliente}! 👋

Seu agendamento na *Barbearia Corte Nobre* foi reagendado:

📅 *Nova Data:* ${dataFormatada}
⏰ *Novo Horário:* ${appointment.horario}
✂️ *Barbeiro:* ${appointment.barbeiro}

Confirmado! Te esperamos no novo horário. 💈

Obrigado pela compreensão!`

    case "cancelamento":
      return `Olá ${nomeCliente}! 😔

Infelizmente precisamos cancelar seu agendamento:

📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${appointment.horario}

Pedimos desculpas pelo inconveniente. Entre em contato conosco para reagendar quando for conveniente.

*Barbearia Corte Nobre* 💈`

    default:
      return `Olá ${nomeCliente}! Mensagem da Barbearia Corte Nobre. 💈`
  }
}

// Reminder Scheduler
function startReminderScheduler() {
  // Check for reminders every 30 minutes
  setInterval(checkForReminders, 30 * 60 * 1000)

  // Also check immediately
  checkForReminders()
}

function checkForReminders() {
  if (!automationSettings.autoReminder || !whatsappConfig.autoSendEnabled) {
    return
  }

  const now = new Date()
  const reminderTime = automationSettings.reminderHours * 60 * 60 * 1000 // Convert to milliseconds

  agendamentos.forEach((appointment) => {
    if (appointment.status !== "agendado") return

    const appointmentDateTime = new Date(appointment.data + " " + appointment.horario)
    const timeDiff = appointmentDateTime.getTime() - now.getTime()

    // Check if it's time to send reminder (within 30 minutes of the target time)
    if (timeDiff > 0 && timeDiff <= reminderTime && timeDiff >= reminderTime - 30 * 60 * 1000) {
      // Check if reminder was already sent
      const reminderSent = messageLogs.some(
        (log) =>
          log.phone === appointment.telefone.replace(/\D/g, "") &&
          log.type === "lembrete" &&
          log.status === "sent" &&
          new Date(log.timestamp).toDateString() === now.toDateString(),
      )

      if (!reminderSent) {
        sendAutomaticWhatsAppMessage(appointment, "lembrete")
      }
    }
  })
}

function formatPhoneNumber(e) {
  let value = e.target.value.replace(/\D/g, "")

  if (value.length >= 11) {
    value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (value.length >= 7) {
    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
  } else if (value.length >= 3) {
    value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2")
  }

  e.target.value = value
}

function updateHorarioOptions() {
  const barbeiroSelect = document.getElementById("barbeiro")
  const dataInput = document.getElementById("data")
  const horarioSelect = document.getElementById("horario")

  if (barbeiroSelect.value && dataInput.value) {
    // Enable horario select
    horarioSelect.disabled = false

    // Get occupied times for selected barbeiro and date
    const occupiedTimes = agendamentos
      .filter((a) => a.barbeiro === barbeiroSelect.value && a.data === dataInput.value && a.status !== "cancelado")
      .map((a) => a.horario)

    // Update options
    const options = horarioSelect.querySelectorAll("option")
    options.forEach((option) => {
      if (option.value) {
        option.disabled = occupiedTimes.includes(option.value)
        option.textContent = option.value + (occupiedTimes.includes(option.value) ? " (Ocupado)" : "")
      }
    })

    // Update placeholder
    horarioSelect.querySelector('option[value=""]').textContent = "Selecione um horário"
  } else {
    horarioSelect.disabled = true
    horarioSelect.querySelector('option[value=""]').textContent = "Selecione um barbeiro e data primeiro"
  }
}

function updateVisitCounter() {
  document.getElementById("visit-count").textContent = visitCount
}

function generateCalendar() {
  const calendar = document.getElementById("calendar")

  // Clear existing calendar
  calendar.innerHTML = ""

  // Create calendar header
  const header = document.createElement("div")
  header.className = "calendar-header"

  const prevBtn = document.createElement("button")
  prevBtn.className = "calendar-nav"
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'
  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1)
    generateCalendar()
  })

  const nextBtn = document.createElement("button")
  nextBtn.className = "calendar-nav"
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>'
  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1)
    generateCalendar()
  })

  const title = document.createElement("div")
  title.className = "calendar-title"
  title.textContent = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  header.appendChild(prevBtn)
  header.appendChild(title)
  header.appendChild(nextBtn)
  calendar.appendChild(header)

  // Create calendar grid
  const grid = document.createElement("div")
  grid.className = "calendar-grid"

  // Add weekday headers
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  weekdays.forEach((day) => {
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day calendar-weekday"
    dayElement.textContent = day
    grid.appendChild(dayElement)
  })

  // Get first day of month and number of days
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const today = new Date()

  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDay.getDay(); i++) {
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day other-month"
    grid.appendChild(dayElement)
  }

  // Add days of month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day"
    dayElement.textContent = day

    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayString = dayDate.toISOString().split("T")[0]

    // Check if it's today
    if (dayDate.toDateString() === today.toDateString()) {
      dayElement.classList.add("today")
    }

    // Check if it's selected
    if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
      dayElement.classList.add("selected")
    }

    // Add click event
    dayElement.addEventListener("click", () => {
      // Remove previous selection
      document.querySelectorAll(".calendar-day.selected").forEach((el) => {
        el.classList.remove("selected")
      })

      // Add selection to clicked day
      dayElement.classList.add("selected")
      selectedDate = dayDate

      // Update daily appointments
      updateDailyAppointments(dayString)
    })

    grid.appendChild(dayElement)
  }

  calendar.appendChild(grid)
}

function updateDailyAppointments(date = null) {
  const container = document.getElementById("daily-appointments")
  const targetDate =
    date || (selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0])

  const dayAppointments = agendamentos.filter((a) => a.data === targetDate)

  if (dayAppointments.length === 0) {
    container.innerHTML = '<p class="no-appointments">Nenhum agendamento encontrado</p>'
    return
  }

  container.innerHTML = ""

  dayAppointments.forEach((appointment) => {
    const item = document.createElement("div")
    item.className = "appointment-item"

    item.innerHTML = `
            <div class="appointment-header">
                <div class="appointment-name">${appointment.nomeCompleto}</div>
                <div class="appointment-status status-${appointment.status}">${appointment.status}</div>
            </div>
            <div class="appointment-details">
                <strong>Barbeiro:</strong> ${appointment.barbeiro}<br>
                <strong>Horário:</strong> ${appointment.horario}<br>
                <strong>Telefone:</strong> ${appointment.telefone}
                ${appointment.observacoes ? `<br><strong>Observações:</strong> ${appointment.observacoes}` : ""}
            </div>
            <div class="appointment-actions">
                <button class="whatsapp-btn" onclick="openWhatsAppModal('${appointment.id}', 'lembrete')">
                    <i class="fab fa-whatsapp"></i>
                    Lembrete
                </button>
                <button class="whatsapp-btn" onclick="openWhatsAppModal('${appointment.id}', 'confirmacao')">
                    <i class="fab fa-whatsapp"></i>
                    Confirmar
                </button>
            </div>
        `

    container.appendChild(item)
  })
}

function updateAppointmentsList() {
  updateDailyAppointments()
}

function updateManageList() {
  const container = document.getElementById("manage-appointments")

  if (agendamentos.length === 0) {
    container.innerHTML = '<p class="no-appointments">Nenhum agendamento para gerenciar</p>'
    return
  }

  container.innerHTML = ""

  // Sort appointments by date and time
  const sortedAppointments = [...agendamentos].sort((a, b) => {
    const dateA = new Date(a.data + " " + a.horario)
    const dateB = new Date(b.data + " " + b.horario)
    return dateB - dateA // Most recent first
  })

  sortedAppointments.forEach((appointment) => {
    const item = document.createElement("div")
    item.className = "manage-item"

    const dataFormatada = new Date(appointment.data).toLocaleDateString("pt-BR")

    item.innerHTML = `
            <div class="manage-header">
                <div class="manage-info">
                    <h4>${appointment.nomeCompleto}</h4>
                    <p>${appointment.email}</p>
                </div>
                <div class="appointment-status status-${appointment.status}">${appointment.status}</div>
            </div>
            <div class="manage-details">
                <div>
                    <strong>Barbeiro:</strong> ${appointment.barbeiro}<br>
                    <strong>Data:</strong> ${dataFormatada}<br>
                    <strong>Horário:</strong> ${appointment.horario}
                </div>
                <div>
                    <strong>Telefone:</strong> ${appointment.telefone}
                    ${appointment.observacoes ? `<br><strong>Observações:</strong> ${appointment.observacoes}` : ""}
                </div>
            </div>
            <div class="manage-actions">
                <button class="btn-status btn-agendado" onclick="updateAppointmentStatus('${appointment.id}', 'agendado')">
                    Agendado
                </button>
                <button class="btn-status btn-concluido" onclick="updateAppointmentStatus('${appointment.id}', 'concluido')">
                    Concluído
                </button>
                <button class="btn-status btn-cancelado" onclick="updateAppointmentStatus('${appointment.id}', 'cancelado')">
                    Cancelado
                </button>
                <button class="whatsapp-btn" onclick="openWhatsAppModal('${appointment.id}', 'lembrete')">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
            </div>
        `

    container.appendChild(item)
  })
}

function updateAppointmentStatus(id, newStatus) {
  const appointment = agendamentos.find((a) => a.id === id)
  if (appointment) {
    const oldStatus = appointment.status
    appointment.status = newStatus
    saveData()

    showToast("Status atualizado", `Agendamento marcado como ${newStatus}`, "success")

    // Update all lists
    updateManageList()
    updateAppointmentsList()
    updateDailyAppointments()

    // Send automatic status update message if enabled
    if (automationSettings.autoStatusUpdate && whatsappConfig.autoSendEnabled) {
      if (newStatus === "cancelado" && oldStatus !== "cancelado") {
        sendAutomaticWhatsAppMessage(appointment, "cancelamento")
      } else if (newStatus === "agendado" && oldStatus === "cancelado") {
        sendAutomaticWhatsAppMessage(appointment, "reagendamento")
      }
    }
  }
}

// WhatsApp Modal Functions
function openWhatsAppModal(appointmentId, templateType = "confirmacao") {
  const appointment =
    typeof appointmentId === "string" ? agendamentos.find((a) => a.id === appointmentId) : appointmentId

  if (!appointment) {
    showToast("Erro", "Agendamento não encontrado", "error")
    return
  }

  currentAppointment = appointment
  const modal = document.getElementById("whatsapp-modal")
  modal.classList.add("show")

  // Clear previous selection
  document.querySelectorAll(".template-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Select template and generate message
  selectTemplate(templateType)
}

function closeWhatsAppModal() {
  const modal = document.getElementById("whatsapp-modal")
  modal.classList.remove("show")
  currentAppointment = null

  // Clear form
  document.getElementById("message-text").value = ""
  document.querySelectorAll(".template-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
}

function selectTemplate(templateType) {
  if (!currentAppointment) return

  // Update active button
  document.querySelectorAll(".template-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[onclick="selectTemplate('${templateType}')"]`).classList.add("active")

  const messageTextarea = document.getElementById("message-text")
  const message = generateWhatsAppMessage(currentAppointment, templateType)
  messageTextarea.value = message
}

function sendWhatsAppMessage() {
  if (!currentAppointment) {
    showToast("Erro", "Nenhum agendamento selecionado", "error")
    return
  }

  const message = document.getElementById("message-text").value.trim()
  if (!message) {
    showToast("Erro", "Digite uma mensagem antes de enviar", "error")
    return
  }

  const sendViaAPI = document.getElementById("send-via-api").checked

  if (sendViaAPI && whatsappConfig.autoSendEnabled) {
    // Send via API
    sendAutomaticWhatsAppMessage(currentAppointment, "personalizada")
  } else {
    // Send via WhatsApp Web (original method)
    const phoneNumber = currentAppointment.telefone.replace(/\D/g, "")

    if (phoneNumber.length < 10) {
      showToast("Erro", "Número de telefone inválido", "error")
      return
    }

    let whatsappNumber = phoneNumber
    if (!whatsappNumber.startsWith("55")) {
      whatsappNumber = "55" + whatsappNumber
    }

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
    showToast("WhatsApp aberto!", `Mensagem preparada para ${currentAppointment.nomeCompleto}`, "success")
  }

  closeWhatsAppModal()
}

function showToast(title, description, type = "success") {
  const toast = document.getElementById("toast")
  const titleElement = toast.querySelector(".toast-title")
  const descriptionElement = toast.querySelector(".toast-description")
  const iconElement = toast.querySelector(".toast-icon")

  titleElement.textContent = title
  descriptionElement.textContent = description

  // Set icon based on type
  if (type === "success") {
    iconElement.className = "toast-icon fas fa-check-circle"
    toast.className = "toast success"
  } else if (type === "error") {
    iconElement.className = "toast-icon fas fa-exclamation-circle"
    toast.className = "toast error"
  } else if (type === "warning") {
    iconElement.className = "toast-icon fas fa-exclamation-triangle"
    toast.className = "toast warning"
  }

  // Show toast
  toast.classList.add("show")

  // Hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove("show")
  }, 4000)
}

// Make functions available globally for onclick handlers
window.updateAppointmentStatus = updateAppointmentStatus
window.openWhatsAppModal = openWhatsAppModal
window.closeWhatsAppModal = closeWhatsAppModal
window.selectTemplate = selectTemplate
window.sendWhatsAppMessage = sendWhatsAppMessage
window.testWhatsAppConnection = testWhatsAppConnection
window.saveAutomationSettings = saveAutomationSettings
window.refreshTemplates = refreshTemplates
window.refreshMessageLogs = refreshMessageLogs
