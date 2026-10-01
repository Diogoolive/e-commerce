document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. ELEMENTOS DA INTERFACE DE AUTENTICAÇÃO
    // ==========================================
    const loggedInElements = document.querySelectorAll(".auth-logged-in");
    const loggedOutElements = document.querySelectorAll(".auth-logged-out");
    const userGreeting = document.getElementById("user-greeting");
    const btnLogout = document.getElementById("btn-logout");
    const navAdmin = document.getElementById("nav-admin");

    // ==========================================
    // 2. ATUALIZAÇÃO DA INTERFACE COM BASE NO LOGIN
    // ==========================================
    function atualizarInterfaceAuth() {
        const token = localStorage.getItem("user_token");
        const userJson = localStorage.getItem("user_data");

        if (token && userJson) {
            try {
                const user = JSON.parse(userJson);

                console.log("Usuário logado:", user.name);
                console.log("Role do usuário:", user.role);

                // Exibe elementos de usuário logado
                loggedInElements.forEach(el => el.classList.remove("hidden"));
                loggedOutElements.forEach(el => el.classList.add("hidden"));

                // Atualiza a mensagem de saudação
                if (userGreeting) {
                    userGreeting.textContent = `Olá, ${user.name || 'Usuário'}`;
                }

                // Exibe a Aba Administração apenas para perfil 'admin'
                if (user.role === "admin" && navAdmin) {
                    navAdmin.classList.remove("hidden");
                } else if (navAdmin) {
                    navAdmin.classList.add("hidden");
                }
                return;

            } catch (e) {
                console.error("Erro ao processar dados do usuário:", e);
            }
        }

        // Caso esteja deslogado ou os dados sejam inválidos
        loggedInElements.forEach(el => el.classList.add("hidden"));
        loggedOutElements.forEach(el => el.classList.remove("hidden"));
        if (navAdmin) navAdmin.classList.add("hidden");
    }

    // ==========================================
    // 3. ENCERRAMENTO DE SESSÃO (LOGOUT)
    // ==========================================
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("user_token");
            localStorage.removeItem("user_data");
            
            alert("Sessão encerrada com sucesso!");
            atualizarInterfaceAuth();
            window.location.href = "index.html";
        });
    }

    // ==========================================
    // 4. SUBMISSÃO DO FORMULÁRIO DE LOGIN
    // ==========================================
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById("email").value;
            const passwordInput = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailInput, password: passwordInput })
                });

                const data = await response.json();

                if (response.ok && data.sucesso) {
                    // Armazena o Token JWT e as informações do usuário
                    localStorage.setItem("user_token", data.token);
                    localStorage.setItem("user_data", JSON.stringify(data.user));

                    alert(`Bem-vindo, ${data.user.name}!`);
                    window.location.href = "index.html";
                } else {
                    alert(data.mensagem || "E-mail ou senha incorretos!");
                }
            } catch (error) {
                console.error("Erro na comunicação com o servidor:", error);
                alert("Não foi possível conectar ao servidor Node.js.");
            }
        });
    }

    // ==========================================
    // 5. SUBMISSÃO DO FORMULÁRIO DE CADASTRO
    // ==========================================
    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById("signup-name").value;
            const emailInput = document.getElementById("signup-email").value;
            const passwordInput = document.getElementById("signup-password").value;

            try {
                const response = await fetch("http://localhost:3000/api/cadastro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: nameInput,
                        email: emailInput,
                        password: passwordInput
                    })
                });

                const data = await response.json();

                if (response.ok && data.sucesso) {
                    alert("Cadastro realizado com sucesso! Faça login para continuar.");
                    window.location.href = "login.html";
                } else {
                    alert(data.mensagem || "Erro ao realizar o cadastro.");
                }
            } catch (error) {
                console.error("Erro na comunicação com o servidor:", error);
                alert("Não foi possível conectar ao servidor.");
            }
        });
    }

    // ==========================================
    // 6. GERENCIAMENTO DO CARRINHO DE COMPRAS
    // ==========================================
    const cartBtn = document.getElementById("cart-btn");
    const cartModal = document.getElementById("cart-modal");
    const closeCart = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const cartCountElement = document.getElementById("cart-count");
    const clearCartBtn = document.getElementById("clear-cart-btn");
    const btnAddCartList = document.querySelectorAll(".btn-add");

    function obterCarrinho() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function salvarCarrinho(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
        atualizarContadorCarrinho();
    }

    function atualizarContadorCarrinho() {
        const cart = obterCarrinho();
        const totalItens = cart.reduce((acc, item) => acc + item.quantidade, 0);
        if (cartCountElement) cartCountElement.textContent = totalItens;
    }

    // Remove um único item do carrinho pelo ID
    function removerItemDoCarrinho(id) {
        let cart = filterCartById(id);
        salvarCarrinho(cart);
        renderizarCarrinho();
    }

    function filterCartById(id) {
        let cart = obterCarrinho();
        return cart.filter(item => item.id !== id);
    }

    function renderizarCarrinho() {
        const cart = obterCarrinho();
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p style='text-align:center; padding: 15px;'>Seu carrinho está vazio.</p>";
            if (cartTotalPrice) cartTotalPrice.textContent = "R$ 0,00";
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantidade;
            total += itemTotal;

            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;";
            
            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small>Qtd: ${item.quantidade} x R$ ${item.price.toFixed(2).replace('.', ',')}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <strong>R$ ${itemTotal.toFixed(2).replace('.', ',')}</strong>
                    <button class="btn-remove-item" data-id="${item.id}" title="Remover item" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        // Associa os eventos de exclusão individual
        document.querySelectorAll(".btn-remove-item").forEach(button => {
            button.addEventListener("click", (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                removerItemDoCarrinho(id);
            });
        });

        if (cartTotalPrice) {
            cartTotalPrice.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    }

    // Adiciona produtos ao carrinho
    btnAddCartList.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            const name = button.getAttribute("data-name");
            const price = parseFloat(button.getAttribute("data-price"));

            let cart = obterCarrinho();
            const itemExistente = cart.find(item => item.id === id);

            if (itemExistente) {
                itemExistente.quantidade += 1;
            } else {
                cart.push({ id, name, price, quantidade: 1 });
            }

            salvarCarrinho(cart);
            alert(`${name} adicionado ao carrinho!`);
        });
    });

    // Abrir Modal
    if (cartBtn) {
        cartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            renderizarCarrinho();
            if (cartModal) cartModal.classList.remove("hidden");
        });
    }

    // Fechar Modal no X
    if (closeCart) {
        closeCart.addEventListener("click", () => {
            if (cartModal) cartModal.classList.add("hidden");
        });
    }

    // Esvaziar todo o carrinho
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            localStorage.removeItem("cart");
            atualizarContadorCarrinho();
            renderizarCarrinho();
        });
    }

    // Fechar Modal clicando no fundo escuro
    window.addEventListener("click", (e) => {
        if (e.target === cartModal) {
            cartModal.classList.add("hidden");
        }
    });

    // ==========================================
    // 7. INICIALIZAÇÃO DA PÁGINA
    // ==========================================
    atualizarInterfaceAuth();
    atualizarContadorCarrinho();
});