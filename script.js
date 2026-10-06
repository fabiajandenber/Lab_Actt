const STUDENT_NUMBER_PATTERN = /^\d{2}-\d{4}-\d{3}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WORKSHOP_FEES = {
  "web development": 500,
  "ui/ux design": 400,
  "cybersecurity": 600
};

function validateStudentInfo(name, studentNumber, email) {
  if (
    typeof name !== "string" ||
    typeof studentNumber !== "string" ||
    typeof email !== "string"
  ) {
    return false;
  }

  const trimmedName = name.trim();
  const nameValid = trimmedName.length >= 3 && !/\d/.test(trimmedName);
  const numberValid = STUDENT_NUMBER_PATTERN.test(studentNumber);
  const emailValid = EMAIL_PATTERN.test(email);

  return nameValid && numberValid && emailValid;
}

function getBaseFee(workshop) {
  if (typeof workshop !== "string") return 0;
  const key = workshop.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(WORKSHOP_FEES, key)
    ? WORKSHOP_FEES[key]
    : 0;
}

function isScholar(studentType) {
  return typeof studentType === "string" &&
    studentType.trim().toLowerCase() === "scholar";
}

function calculateFinalFee(workshop, studentType) {
  const base = getBaseFee(workshop);
  const discountRate = isScholar(studentType) ? 0.2 : 0;
  return Math.round(base * (1 - discountRate) * 100) / 100;
}

if (typeof document !== "undefined") {
  const form = document.getElementById("registrationForm");
  const studentNameInput = document.getElementById("studentName");
  const studentNumberInput = document.getElementById("studentNumber");
  const emailInput = document.getElementById("email");
  const workshopSelect = document.getElementById("workshop");
  const regularRadio = document.getElementById("studentTypeRegular");
  const scholarRadio = document.getElementById("studentTypeScholar");
  const termsCheckbox = document.getElementById("terms");

  const nameError = document.getElementById("nameError");
  const studentNumberError = document.getElementById("studentNumberError");
  const emailError = document.getElementById("emailError");
  const workshopError = document.getElementById("workshopError");
  const termsError = document.getElementById("termsError");

  const registrationFee = document.getElementById("registrationFee");
  const discountDisplay = document.getElementById("discount");
  const finalFeeDisplay = document.getElementById("finalFee");

  const registerBtn = document.getElementById("registerBtn");
  const clearBtn = document.getElementById("clearBtn");

  const registrationResult = document.getElementById("registrationResult");
  const summaryName = document.getElementById("summaryName");
  const summaryStudentNumber = document.getElementById("summaryStudentNumber");
  const summaryEmail = document.getElementById("summaryEmail");
  const summaryWorkshop = document.getElementById("summaryWorkshop");
  const summaryStudentType = document.getElementById("summaryStudentType");
  const summaryFee = document.getElementById("summaryFee");
  const summaryDiscount = document.getElementById("summaryDiscount");
  const summaryFinalFee = document.getElementById("summaryFinalFee");

  const MESSAGES = {
    name: "Enter a valid student name.",
    studentNumber: "Enter a valid student number.",
    email: "Enter a valid email address.",
    workshop: "Please select a workshop.",
    terms: "You must accept the Terms and Conditions."
  };

  // ---------- Helpers ----------
  function formatPeso(amount) {
    return "\u20B1" + amount;
  }

  function showResult() {
    registrationResult.hidden = false;
    registrationResult.style.display = "block";
  }

  function hideResult() {
    registrationResult.hidden = true;
    registrationResult.style.display = "none";
  }

  // Returns the selected workshop name, or "" if the default option is chosen
  function getSelectedWorkshop() {
    const value = (workshopSelect.value || "").trim();
    if (getBaseFee(value) > 0) return value;

    // Fallback: try the visible text of the selected option
    const option = workshopSelect.options[workshopSelect.selectedIndex];
    const text = option ? option.textContent.trim() : "";
    return getBaseFee(text) > 0 ? text : "";
  }

  // Returns "Regular Student", "Scholar", or "" if nothing is selected
  function getSelectedStudentType() {
    if (scholarRadio.checked) return "Scholar";
    if (regularRadio.checked) return "Regular Student";
    return "";
  }

  // ---------- PART D: dynamic fee display ----------
  function updateFeeDisplay() {
    const workshop = getSelectedWorkshop();
    const studentType = getSelectedStudentType();

    const base = getBaseFee(workshop);
    const finalFee = calculateFinalFee(workshop, studentType);
    const discountAmount = Math.round((base - finalFee) * 100) / 100;

    registrationFee.textContent = formatPeso(base);
    discountDisplay.textContent = formatPeso(discountAmount);
    finalFeeDisplay.textContent = formatPeso(finalFee);
  }

  // ---------- Error helpers ----------
  function clearErrors() {
    nameError.textContent = "";
    studentNumberError.textContent = "";
    emailError.textContent = "";
    workshopError.textContent = "";
    termsError.textContent = "";
  }

  // ---------- PART E & F: form submission ----------
  function handleSubmit(event) {
    if (event) event.preventDefault();

    const name = studentNameInput.value.trim();
    const studentNumber = studentNumberInput.value.trim();
    const email = emailInput.value.trim();
    const workshop = getSelectedWorkshop();
    const studentType = getSelectedStudentType();

    clearErrors();
    let valid = true;

    // Validate each field individually so specific messages can be shown
    if (!validateStudentInfo(name, "00-0000-000", "a@b.c")) {
      nameError.textContent = MESSAGES.name;
      valid = false;
    }
    if (!validateStudentInfo("Valid Name", studentNumber, "a@b.c")) {
      studentNumberError.textContent = MESSAGES.studentNumber;
      valid = false;
    }
    if (!validateStudentInfo("Valid Name", "00-0000-000", email)) {
      emailError.textContent = MESSAGES.email;
      valid = false;
    }
    if (workshop === "") {
      workshopError.textContent = MESSAGES.workshop;
      valid = false;
    }
    if (!termsCheckbox.checked) {
      termsError.textContent = MESSAGES.terms;
      valid = false;
    }

    if (!valid || !validateStudentInfo(name, studentNumber, email)) {
      hideResult();
      return;
    }

    // Student type is not listed as required; default to Regular Student
    const typeLabel = studentType === "" ? "Regular Student" : studentType;

    const base = getBaseFee(workshop);
    const finalFee = calculateFinalFee(workshop, typeLabel);
    const discountAmount = Math.round((base - finalFee) * 100) / 100;

    // textContent only - never innerHTML for user-entered values
    summaryName.textContent = name;
    summaryStudentNumber.textContent = studentNumber;
    summaryEmail.textContent = email;
    summaryWorkshop.textContent = workshop;
    summaryStudentType.textContent = typeLabel;
    summaryFee.textContent = formatPeso(base);
    summaryDiscount.textContent = formatPeso(discountAmount);
    summaryFinalFee.textContent = formatPeso(finalFee);

    showResult();
  }

  // ---------- PART G: clear / reset ----------
  function handleClear(event) {
    if (event) event.preventDefault();

    studentNameInput.value = "";
    studentNumberInput.value = "";
    emailInput.value = "";
    workshopSelect.selectedIndex = 0;
    regularRadio.checked = false;
    scholarRadio.checked = false;
    termsCheckbox.checked = false;

    clearErrors();

    registrationFee.textContent = formatPeso(0);
    discountDisplay.textContent = formatPeso(0);
    finalFeeDisplay.textContent = formatPeso(0);

    hideResult();
  }

  // ---------- Event listeners ----------
  form.addEventListener("submit", handleSubmit);

  // If the register button is not a submit button, still handle clicks
  if (registerBtn && registerBtn.type !== "submit") {
    registerBtn.addEventListener("click", handleSubmit);
  }

  clearBtn.addEventListener("click", handleClear);
  workshopSelect.addEventListener("change", updateFeeDisplay);
  regularRadio.addEventListener("change", updateFeeDisplay);
  scholarRadio.addEventListener("change", updateFeeDisplay);

  // ---------- PART A: initial state ----------
  hideResult();
  registrationFee.textContent = formatPeso(0);
  discountDisplay.textContent = formatPeso(0);
  finalFeeDisplay.textContent = formatPeso(0);
}

// ==========================================================
// Export for Node-based function tests
// ==========================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validateStudentInfo, calculateFinalFee };
}