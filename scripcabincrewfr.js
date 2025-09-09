// Header scroll effect with throttling
let lastScrollPosition = window.scrollY;
let ticking = false;

window.addEventListener('scroll', () => {
const header = document.querySelector('.header');

if (window.scrollY > 50) {
header.classList.add('scrolled');
} else {
header.classList.remove('scrolled');
}
});


// Animate elements on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.form-container, .video-container').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});






document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("leadForm");
    const phoneInput = document.getElementById("phone");
    const phoneError = document.getElementById("phoneError");
    const submitBtn = form.querySelector("button[type='submit']");
    let isSubmitting = false; // 🔴 Flag para impedir envios duplicados

    // Configuração do intl-tel-input
    var iti = window.intlTelInput(phoneInput, {
        initialCountry: "fr",
        preferredCountries: ["fr", "pt", "es", "br"],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
    });

    // Função para validar e corrigir número de telefone
    function validatePhoneNumber() {
        var fullPhoneNumber = iti.getNumber();
        var isValid = iti.isValidNumber();

        if (!isValid || fullPhoneNumber.includes("undefined")) {
            phoneError.style.display = "block";
            phoneInput.classList.add("is-invalid");
            phoneInput.setCustomValidity("Número inválido");
            return false;
        } else {
            phoneError.style.display = "none";
            phoneInput.classList.remove("is-invalid");
            phoneInput.setCustomValidity("");
            return fullPhoneNumber;
        }
    }

    // 🔴 Remover qualquer evento duplicado antes de adicionar um novo
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede envio padrão

        // 🔴 Evita envios duplicados
        if (isSubmitting) {
            console.log("Envio bloqueado para evitar duplicação.");
            return;
        }
        isSubmitting = true; // 🔴 Define a flag para evitar envios duplicados

        var fullPhoneNumber = validatePhoneNumber();
        if (!fullPhoneNumber) {
            isSubmitting = false; // 🔴 Libera para novo envio se o número for inválido
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            isSubmitting = false; // 🔴 Libera para novo envio se houver erro no formulário
            return;
        }

        // Atualiza o valor do campo telefone com o número formatado corretamente
        phoneInput.value = fullPhoneNumber;

        console.log("Número enviado:", fullPhoneNumber); // Debug

        // Evita envios duplicados desativando o botão temporariamente
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi...";

        const formData = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                window.location.href = "/sucessofr.html";
            } else {
                alert("Erreur d'envoi du formulaire. Veuillez réessayer.");
            }
        })
        .catch(error => {
            console.error("Erro ao enviar o formulário:", error);
            alert("Erreur d'envoi du formulaire. Veuillez réessayer.");
        })
        .finally(() => {
            isSubmitting = false; // 🔴 Libera para novo envio após resposta do servidor
            submitBtn.disabled = false; // Reativa o botão após a resposta do servidor
            submitBtn.textContent = "Je veux être membre du personnel de cabine";
        });
    }, { once: true }); // 🔴 O evento `submit` agora só pode ser registrado UMA VEZ
});



document.getElementById('leadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio imediato

    grecaptcha.ready(function() {
        grecaptcha.execute('6LdrdO8qAAAAAAmgcczCLR_rhm1a2_Z-zLUFAOvc', {action: 'submit'}).then(function(token) {
            document.getElementById('recaptchaResponse').value = token;

            // Agora envia os dados para o Cloudflare Worker
            enviarDados();
        });
    });
});

function enviarDados() {
    let form = document.getElementById('leadForm');
    let formData = new FormData(form);

    fetch("https://validar-recaptcha.geral-284.workers.dev/", { // Substitua pela URL do seu Worker
        method: "POST",
        body: JSON.stringify({ recaptcha_response: formData.get("recaptcha_response") }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Verificação bem-sucedida! Enviando formulário...");
            form.submit(); // Agora podemos enviar o formulário para o Google Sheets
        } else {
            alert("Erro na verificação do reCAPTCHA.");
        }
    })
    .catch(error => console.error("Erro:", error));
}
