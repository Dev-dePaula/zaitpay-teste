(function() {
  // Versão 100% Cliente (Mock/Local) Ultra Completa e Robusta para demonstração no GitHub Pages.
  // Todo o estado do banco de dados simulado é persistido no localStorage para parecer real.

  const DEFAULT_DB = {
    users: [
      { id: 'USR-ADMIN', name: 'Anderson Admin', email: 'admin@pay.com', password: '123456', role: 'admin', active: true, isLogged: false, type: 'PF', doc: '000.000.000-00', allowedMode: 'all' },
      { id: 'USR-CLI1', name: 'Tech Store SP', email: 'loja@tech.com', password: '123456', role: 'client', active: true, isLogged: false, type: 'PJ', doc: '12.345.678/0001-99', rg: '12.345.678-9', phone: '(11) 99999-0000', address: 'Av. Paulista, 1000 - São Paulo/SP', facialStatus: 'Facial validada no onboarding', allowedMode: 'zait', apiAtiva: true }
    ],
    ledgers: { 
      'USR-ADMIN': { 
        zait: { balance: 750000.00, transactions: [], boletos: [], links: [], accountId: 'ACC-A1', agency: '0001', accountNumber: '750000', accountDigit: '9' }, 
        voltz: { balance: 230000.00, transactions: [], boletos:[], links:[], accountId: 'ACC-A2', agency: '0002', accountNumber: '230000', accountDigit: '8' } 
      },
      'USR-CLI1': { 
        zait: { 
          balance: 15200.00, 
          accountId: 'ACC-C1',
          agency: '0001',
          accountNumber: '15200',
          accountDigit: '3',
          transactions: [
            { id: 'PIX-E55291', method:'PIX', type:'Entrada', value: 500, description:'PIX Recebido: Carlos Silva', date:'20/05/2026 10:14' },
            { id: 'CART-C11920', method:'CARTAO', type:'Entrada', cardType: 'Crédito', installments: 3, merchant: 'Tech Store SP', value: 1200, description:'Venda via Checkout Link', date:'19/05/2026 14:22' },
            { id: 'CART-D88291', method:'CARTAO', type:'Saída', cardType: 'Débito', installments: 1, merchant: 'Posto Ipiranga Centro', value: 150, description:'Compra no Débito Estabelecimento', date:'18/05/2026 17:05' }
          ], 
          boletos: [
            { id: 'BOL-9921A', value: 450, desc: 'Fatura Consultoria', status: 'Pago', issueDate: '2026-05-18', dueDate: '2026-05-25' },
            { id: 'BOL-1102B', value: 900, desc: 'Venda de Equipamentos', status: 'Pendente', issueDate: '2026-05-20', dueDate: '2026-05-30' }
          ], 
          links: [
            { id: 'LNK-402', desc: 'Monitor Gamer 4K', value: 2500, parc: 12, emailDestino: 'comprador@gmail.com' }
          ] 
        }, 
        voltz: { 
          balance: 300.00, 
          accountId: 'ACC-C2',
          agency: '0002',
          accountNumber: '300',
          accountDigit: '4',
          transactions: [], 
          boletos:[], 
          links:[] 
        } 
      }
    },
    voltzPools: [
      { 
        id: 'POOL-01', 
        name: 'Pool Liquidez Alfa', 
        size: 'Grande', 
        balance: 150000.00, 
        clientsCount: 1, 
        active: true, 
        feePercent: 1.5, 
        minBalance: 1000.00, 
        autoChargeDay: 5, 
        baasProvider: 'suitpay',
        baasBaseUrl: 'https://api.suitpay.com.br',
        monthlyMaintenanceFee: 29.90,
        pixFeeFixed: 0.99,
        boletoFeeFixed: 1.99,
        debitCardFeePercent: 1.2,
        creditCardFeePercent: 2.5,
        clients: [
          { userId: 'USR-CLI1', status: 'ACTIVE', poolBalance: 300.00, user: { name: 'Tech Store SP', email: 'loja@tech.com' } }
        ],
        ledger: [
          { id: 'L-01', userId: 'USR-CLI1', method: 'Ajuste', type: 'CREDIT', amount: 300.00, description: 'Carga Inicial de Teste', createdAt: new Date().toISOString() }
        ] 
      },
      { 
        id: 'POOL-02', 
        name: 'Pool Garantidor Beta', 
        size: 'Médio', 
        balance: 80000.00, 
        clientsCount: 0, 
        active: true, 
        feePercent: 2.0, 
        minBalance: 500.00, 
        autoChargeDay: 10, 
        baasProvider: 'fitbank',
        baasBaseUrl: 'https://api.fitbank.com.br',
        monthlyMaintenanceFee: 49.90,
        pixFeeFixed: 1.49,
        boletoFeeFixed: 2.49,
        debitCardFeePercent: 1.5,
        creditCardFeePercent: 2.9,
        clients: [],
        ledger: [] 
      }
    ],
    voltzPoolsSummary: { totalBalance: 230000.00, activePools: 2, totalClients: 1, totalFeesCollected: 150.00 }
  };

  function getLocalDb() {
    let local = localStorage.getItem('zait_demo_db');
    if(!local) {
      localStorage.setItem('zait_demo_db', JSON.stringify(DEFAULT_DB));
      return DEFAULT_DB;
    }
    try {
      return JSON.parse(local);
    } catch(e) {
      localStorage.setItem('zait_demo_db', JSON.stringify(DEFAULT_DB));
      return DEFAULT_DB;
    }
  }

  function saveLocalDb(db) {
    localStorage.setItem('zait_demo_db', JSON.stringify(db));
  }

  function getToken() {
    return localStorage.getItem('zait_token') || 'mock_token_demo';
  }

  function saveAuth(user) {
    localStorage.setItem('zait_token', 'mock_token_demo');
    localStorage.setItem('token', 'mock_token_demo');
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('activeUser', JSON.stringify(user));
  }

  // API MOCK
  window.ZaitPayApi = {
    async request(path, options = {}) {
      const db = getLocalDb();
      const cleanPath = String(path || '').replace(/^\//, '');
      const method = String(options.method || 'GET').toUpperCase();

      console.log(`[Mock API] Request: ${method} /${cleanPath}`, options);

      // GET /users (Clientes)
      if(cleanPath === 'users' && method === 'GET') {
        return db.users;
      }

      // GET /financial-accounts
      if(cleanPath === 'financial-accounts' && method === 'GET') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if(!currentUser) return [];
        const userLedgers = db.ledgers[currentUser.id] || { zait: { balance: 0 }, voltz: { balance: 0 } };
        const activeCores = [];
        
        // Retorna apenas as contas ativas do usuário logado
        if (currentUser.role.toUpperCase() === 'CLIENT') {
          const mode = currentUser.allowedMode || 'zait';
          if(mode === 'zait' || mode === 'all') {
            activeCores.push({
              id: userLedgers.zait?.accountId || 'ACC-Z1',
              user_id: currentUser.id,
              core: 'ZAIT',
              balance: userLedgers.zait?.balance || 0,
              agency: userLedgers.zait?.agency || '0001',
              account_number: userLedgers.zait?.accountNumber || '15200',
              account_digit: userLedgers.zait?.accountDigit || '3',
              ledger: userLedgers.zait?.transactions || []
            });
          }
          if(mode === 'voltz' || mode === 'all') {
            activeCores.push({
              id: userLedgers.voltz?.accountId || 'ACC-V1',
              user_id: currentUser.id,
              core: 'VOLTZ',
              balance: userLedgers.voltz?.balance || 0,
              agency: userLedgers.voltz?.agency || '0002',
              account_number: userLedgers.voltz?.accountNumber || '300',
              account_digit: userLedgers.voltz?.accountDigit || '4',
              ledger: userLedgers.voltz?.transactions || []
            });
          }
        } else {
          // Admin vê tudo
          activeCores.push({
            id: 'ACC-A1',
            user_id: currentUser.id,
            core: 'ZAIT',
            balance: userLedgers.zait?.balance || 750000,
            agency: '0001',
            account_number: '750000',
            account_digit: '9',
            ledger: []
          });
          activeCores.push({
            id: 'ACC-A2',
            user_id: currentUser.id,
            core: 'VOLTZ',
            balance: userLedgers.voltz?.balance || 230000,
            agency: '0002',
            account_number: '230000',
            account_digit: '8',
            ledger: []
          });
        }
        return activeCores;
      }

      // POST /financial-accounts
      if(cleanPath === 'financial-accounts' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const core = String(body.core || 'ZAIT').toUpperCase();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        return {
          id: `ACC-${core.charAt(0)}-${Date.now()}`,
          user_id: currentUser?.id || 'USR-CLI1',
          core: core,
          balance: 0,
          agency: core === 'VOLTZ' ? '0002' : '0001',
          account_number: '000000',
          account_digit: '0',
          ledger: []
        };
      }

      // GET /voltz-pools
      if(cleanPath === 'voltz-pools' && method === 'GET') {
        return db.voltzPools;
      }

      // GET /voltz-pools/admin/summary
      if(cleanPath === 'voltz-pools/admin/summary' && method === 'GET') {
        return db.voltzPoolsSummary;
      }

      // POST /voltz-pools
      if(cleanPath === 'voltz-pools' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const newPool = {
          id: `POOL-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
          name: body.name || 'Nova Pool de Liquidez',
          size: body.size || 'Médio',
          balance: 0,
          clientsCount: 0,
          active: true,
          feePercent: Number(body.feePercent || 1.5),
          minBalance: Number(body.minBalance || 500.00),
          autoChargeDay: Number(body.autoChargeDay || 5),
          baasProvider: 'mock',
          baasBaseUrl: '',
          monthlyMaintenanceFee: 0,
          pixFeeFixed: 0,
          boletoFeeFixed: 0,
          debitCardFeePercent: 0,
          creditCardFeePercent: 0,
          clients: [],
          ledger: []
        };
        db.voltzPools.push(newPool);
        saveLocalDb(db);
        return newPool;
      }

      // PUT /voltz-pools/:id/config (Configurações Gerais e Split/Tarifas)
      if(cleanPath.startsWith('voltz-pools/') && cleanPath.endsWith('/config') && method === 'PUT') {
        const poolId = cleanPath.split('/')[1];
        const body = JSON.parse(options.body || '{}');
        const pool = db.voltzPools.find(p => p.id === poolId);
        if(!pool) throw new Error('Pool não encontrada.');
        Object.assign(pool, body);
        saveLocalDb(db);
        return pool;
      }

      // POST /voltz-pools/:id/clients (Vincular cliente)
      if(cleanPath.startsWith('voltz-pools/') && cleanPath.endsWith('/clients') && method === 'POST') {
        const poolId = cleanPath.split('/')[1];
        const body = JSON.parse(options.body || '{}');
        const pool = db.voltzPools.find(p => p.id === poolId);
        if(!pool) throw new Error('Pool não encontrada.');
        
        const clientUser = db.users.find(u => u.id === body.userId);
        if(!clientUser) throw new Error('Cliente não encontrado.');

        // Verifica se já está vinculado
        if(!pool.clients) pool.clients = [];
        if(pool.clients.some(c => c.userId === body.userId)) {
          throw new Error('Cliente já vinculado a esta conta bolsão.');
        }

        pool.clients.push({
          userId: body.userId,
          status: 'ACTIVE',
          poolBalance: 0,
          user: { name: clientUser.name, email: clientUser.email }
        });
        pool.clientsCount = pool.clients.length;
        saveLocalDb(db);
        return { success: true, pool };
      }

      // PUT /voltz-pools/:id/clients/:userId/status (Mudar status do cliente na pool)
      if(cleanPath.startsWith('voltz-pools/') && cleanPath.includes('/clients/') && cleanPath.endsWith('/status') && method === 'PUT') {
        const parts = cleanPath.split('/');
        const poolId = parts[1];
        const userId = parts[3];
        const body = JSON.parse(options.body || '{}');
        
        const pool = db.voltzPools.find(p => p.id === poolId);
        if(!pool) throw new Error('Pool não encontrada.');
        
        const client = pool.clients?.find(c => c.userId === userId);
        if(!client) throw new Error('Cliente não vinculado nesta pool.');
        
        client.status = body.status || 'ACTIVE';
        saveLocalDb(db);
        return { success: true, pool };
      }

      // DELETE /voltz-pools/:id/clients/:userId (Desvincular cliente)
      if(cleanPath.startsWith('voltz-pools/') && cleanPath.includes('/clients/') && method === 'DELETE') {
        const parts = cleanPath.split('/');
        const poolId = parts[1];
        const userId = parts[3];

        const pool = db.voltzPools.find(p => p.id === poolId);
        if(!pool) throw new Error('Pool não encontrada.');

        pool.clients = pool.clients?.filter(c => c.userId !== userId) || [];
        pool.clientsCount = pool.clients.length;
        saveLocalDb(db);
        return { success: true, pool };
      }

      // POST /voltz-pools/:id/ledger (Inserir saldo no bolsão)
      if(cleanPath.startsWith('voltz-pools/') && cleanPath.endsWith('/ledger') && method === 'POST') {
        const poolId = cleanPath.split('/')[1];
        const body = JSON.parse(options.body || '{}');
        const pool = db.voltzPools.find(p => p.id === poolId);
        if(!pool) throw new Error('Pool não encontrada.');

        const amount = Number(body.amount || body.valor || 0);
        const type = String(body.type || 'CREDIT').toUpperCase();
        const userId = body.userId; // Pode ser nulo ou específico

        // Lança no ledger da pool
        if(!pool.ledger) pool.ledger = [];
        pool.ledger.unshift({
          id: `TX-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
          userId: userId || 'ADMIN',
          method: 'Ajuste',
          type: type,
          amount: amount,
          description: body.description || 'Lançamento manual de saldo',
          createdAt: new Date().toISOString()
        });

        // Se for para um cliente específico, ajusta o saldo dele
        if(userId) {
          const client = pool.clients?.find(c => c.userId === userId);
          if(client) {
            const currentBal = Number(client.poolBalance || 0);
            client.poolBalance = type === 'CREDIT' ? currentBal + amount : currentBal - amount;
          }
        }

        // Atualiza saldo total da pool
        const currentTotal = Number(pool.balance || pool.totalBalance || 0);
        pool.balance = type === 'CREDIT' ? currentTotal + amount : currentTotal - amount;
        pool.totalBalance = pool.balance;

        saveLocalDb(db);
        return { success: true, pool };
      }

      // POST /voltz-pools/:id/charge-monthly (Cobrar mensalidade)
      if(cleanPath.startsWith('voltz-pools/') && cleanPath.endsWith('/charge-monthly') && method === 'POST') {
        const poolId = cleanPath.split('/')[1];
        const pool = db.voltzPools.find(p => p.id === poolId);
        if(!pool) throw new Error('Pool não encontrada.');

        const fee = Number(pool.monthlyMaintenanceFee || 0);
        if(fee > 0 && pool.clients) {
          pool.clients.forEach(c => {
            if(c.status === 'ACTIVE') {
              c.poolBalance = Number(c.poolBalance || 0) - fee;
              if(!pool.ledger) pool.ledger = [];
              pool.ledger.unshift({
                id: `TX-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
                userId: c.userId,
                method: 'Tarifa',
                type: 'DEBIT',
                amount: fee,
                description: 'Manutenção Mensal do Bolsão',
                createdAt: new Date().toISOString()
              });
            }
          });
        }
        saveLocalDb(db);
        return { success: true, pool };
      }

      // PUT /auth/me
      if(cleanPath === 'auth/me' && method === 'PUT') {
        const body = JSON.parse(options.body || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if(currentUser) {
          const updated = { ...currentUser, ...body };
          localStorage.setItem('currentUser', JSON.stringify(updated));
          const uIdx = db.users.findIndex(u => u.id === currentUser.id);
          if(uIdx !== -1) {
            db.users[uIdx] = { ...db.users[uIdx], ...body };
            saveLocalDb(db);
          }
          return { success: true, user: updated };
        }
        return { success: false };
      }

      // POST /auth/me/password
      if(cleanPath === 'auth/me/password' && method === 'POST') {
        return { success: true };
      }

      // POST /auth/admin/create-user
      if(cleanPath === 'auth/admin/create-user' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const newUser = {
          id: `USR-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
          name: body.name || 'Novo Cliente',
          email: body.email,
          password: body.password || '123456',
          role: body.role || 'client',
          active: true,
          type: body.type || 'PF',
          doc: body.doc || '000.000.000-00',
          rg: body.rg || '',
          phone: body.phone || '',
          address: body.address || '',
          facialStatus: 'Facial validada no onboarding',
          allowedMode: body.allowedMode || 'zait',
          apiAtiva: true
        };
        db.users.push(newUser);
        db.ledgers[newUser.id] = {
          zait: { balance: 0, accountId: `ACC-Z-${newUser.id}`, agency: '0001', accountNumber: '0000', accountDigit: '1', transactions: [], boletos: [], links: [] },
          voltz: { balance: 0, accountId: `ACC-V-${newUser.id}`, agency: '0002', accountNumber: '0000', accountDigit: '2', transactions: [], boletos: [], links: [] }
        };
        saveLocalDb(db);
        return { success: true, user: newUser };
      }

      // POST /pix/send ou /transfers/ted (TED/PIX manual)
      if((cleanPath === 'pix/send' || cleanPath === 'transfers/ted') && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const activeAccount = localStorage.getItem('activeAccount') || 'zait';
        const value = Number(body.valor || body.amount || 0);
        
        const userLedger = db.ledgers[currentUser.id][activeAccount];
        if(userLedger.balance < value) {
          throw new Error('Saldo insuficiente para realizar esta transferência.');
        }

        userLedger.balance -= value;
        const newTx = {
          id: `TX-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
          method: cleanPath === 'pix/send' ? 'PIX' : 'TED',
          type: 'Saída',
          value: value,
          description: body.description || body.descricao || (cleanPath === 'pix/send' ? 'PIX Enviado' : 'Transferência TED Enviada'),
          date: new Date().toLocaleString('pt-BR')
        };
        userLedger.transactions.unshift(newTx);
        saveLocalDb(db);
        return { success: true, tx: newTx };
      }

      throw new Error(`Rota mock não implementada: ${method} /${cleanPath}`);
    },

    saveAuth,

    async login(email, password) {
      const db = getLocalDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if(!user) throw new Error('E-mail ou senha incorretos.');
      saveAuth(user);
      return { success: true, user };
    },

    async register(payload) {
      const db = getLocalDb();
      const email = payload.email;
      if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Este e-mail já está cadastrado.');
      }

      const newUser = {
        id: `USR-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        name: payload.name || payload.full_name || 'Novo Cliente',
        email: email,
        password: payload.password || '123456',
        role: 'client',
        active: true,
        type: payload.type || 'PJ',
        doc: payload.doc || '00.000.000/0001-00',
        rg: payload.rg || '00.000.000-0',
        phone: payload.phone || '(11) 99999-9999',
        address: payload.address || 'Endereço Demo',
        facialStatus: 'Facial validada no onboarding',
        allowedMode: 'zait', // Começa apenas com ZAIT
        apiAtiva: true
      };

      db.users.push(newUser);
      db.ledgers[newUser.id] = {
        zait: { balance: 0, accountId: `ACC-Z-${newUser.id}`, agency: '0001', accountNumber: '0000', accountDigit: '1', transactions: [], boletos: [], links: [] },
        voltz: { balance: 0, accountId: `ACC-V-${newUser.id}`, agency: '0002', accountNumber: '0000', accountDigit: '2', transactions: [], boletos: [], links: [] }
      };

      saveLocalDb(db);
      saveAuth(newUser);
      return { success: true, user: newUser };
    },

    async verifyOtp(email, code) {
      return { success: true };
    },

    async resendOtp(email) {
      return { success: true };
    },

    async getKycPending() {
      return [];
    },

    async approveKyc(accountId, notes = '') {
      return { success: true };
    },

    async rejectKyc(accountId, reason = '') {
      return { success: true };
    },

    async createPix(payload) {
      const db = getLocalDb();
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const activeAccount = localStorage.getItem('activeAccount') || 'zait';
      
      const value = Number(payload.valor || payload.amount || 0);
      const isEntrada = payload.type === 'Entrada';
      
      const userLedger = db.ledgers[currentUser.id][activeAccount];
      if(!isEntrada && userLedger.balance < value) {
        throw new Error('Saldo insuficiente para realizar esta transferência PIX.');
      }

      userLedger.balance = isEntrada ? userLedger.balance + value : userLedger.balance - value;
      
      const newTx = {
        id: `PIX-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        method: 'PIX',
        type: isEntrada ? 'Entrada' : 'Saída',
        value: value,
        description: payload.description || payload.descricao || (isEntrada ? 'PIX Recebido' : 'PIX Enviado'),
        date: new Date().toLocaleString('pt-BR')
      };

      userLedger.transactions.unshift(newTx);
      saveLocalDb(db);
      return { success: true, tx: newTx };
    },

    async createBoleto(payload) {
      const db = getLocalDb();
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const activeAccount = localStorage.getItem('activeAccount') || 'zait';
      
      const value = Number(payload.valor || 0);
      const userLedger = db.ledgers[currentUser.id][activeAccount];

      const newBoleto = {
        id: `BOL-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        value: value,
        desc: payload.descricao || payload.desc || 'Boleto Gerado',
        status: 'Pendente',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: payload.dueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10)
      };

      userLedger.boletos.unshift(newBoleto);
      saveLocalDb(db);
      return { success: true, boleto: newBoleto };
    },

    async createPaymentLink(payload) {
      const db = getLocalDb();
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const activeAccount = localStorage.getItem('activeAccount') || 'zait';
      
      const value = Number(payload.valor || 0);
      const userLedger = db.ledgers[currentUser.id][activeAccount];

      const newLink = {
        id: `LNK-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        desc: payload.descricao || payload.desc || 'Link de Venda',
        value: value,
        parc: Number(payload.parc || 12),
        emailDestino: payload.emailDestino || 'comprador@exemplo.com'
      };

      userLedger.links.unshift(newLink);
      saveLocalDb(db);
      return { success: true, link: newLink };
    },

    async setClientOperatingMode(userId, mode) {
      const db = getLocalDb();
      const user = db.users.find(u => u.id === userId);
      if(!user) throw new Error('Cliente não encontrado.');
      user.allowedMode = mode;
      saveLocalDb(db);
      return { success: true, user };
    },

    async setUserStatus(userId, active) {
      const db = getLocalDb();
      const user = db.users.find(u => u.id === userId);
      if(!user) throw new Error('Usuário não encontrado.');
      user.active = !!active;
      saveLocalDb(db);
      return { success: true, user };
    },

    async deleteUser(userId) {
      const db = getLocalDb();
      db.users = db.users.filter(u => u.id !== userId);
      delete db.ledgers[userId];
      saveLocalDb(db);
      return { success: true, deletedId: userId };
    },

    async createVoltzPool(payload = {}) {
      const db = getLocalDb();
      const newPool = {
        id: `POOL-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        name: payload.name || 'Nova Pool de Liquidez',
        size: payload.size || 'Médio',
        balance: 0,
        clientsCount: 0,
        active: true,
        feePercent: Number(payload.feePercent || 1.5),
        minBalance: Number(payload.minBalance || 500.00),
        autoChargeDay: Number(payload.autoChargeDay || 5),
        baasProvider: 'mock',
        baasBaseUrl: '',
        monthlyMaintenanceFee: 0,
        pixFeeFixed: 0,
        boletoFeeFixed: 0,
        debitCardFeePercent: 0,
        creditCardFeePercent: 0,
        clients: [],
        ledger: []
      };
      db.voltzPools.push(newPool);
      saveLocalDb(db);
      return newPool;
    },

    async updateVoltzPoolConfig(poolId, payload = {}) {
      const db = getLocalDb();
      const pool = db.voltzPools.find(p => p.id === poolId);
      if(!pool) throw new Error('Pool não encontrada.');
      Object.assign(pool, payload);
      saveLocalDb(db);
      return pool;
    },

    async addVoltzPoolClient(poolId, userId) {
      const db = getLocalDb();
      const pool = db.voltzPools.find(p => p.id === poolId);
      if(!pool) throw new Error('Pool não encontrada.');
      const clientUser = db.users.find(u => u.id === userId);
      if(!clientUser) throw new Error('Cliente não encontrado.');

      if(!pool.clients) pool.clients = [];
      if(pool.clients.some(c => c.userId === userId)) return { success: true };

      pool.clients.push({
        userId: userId,
        status: 'ACTIVE',
        poolBalance: 0,
        user: { name: clientUser.name, email: clientUser.email }
      });
      pool.clientsCount = pool.clients.length;
      saveLocalDb(db);
      return { success: true };
    },

    async updateVoltzPoolClientStatus(poolId, userId, status) {
      const db = getLocalDb();
      const pool = db.voltzPools.find(p => p.id === poolId);
      if(!pool) throw new Error('Pool não encontrada.');
      const client = pool.clients?.find(c => c.userId === userId);
      if(client) {
        client.status = status;
      }
      saveLocalDb(db);
      return { success: true };
    },

    async removeVoltzPoolClient(poolId, userId) {
      const db = getLocalDb();
      const pool = db.voltzPools.find(p => p.id === poolId);
      if(!pool) throw new Error('Pool não encontrada.');
      pool.clients = pool.clients?.filter(c => c.userId !== userId) || [];
      pool.clientsCount = pool.clients.length;
      saveLocalDb(db);
      return { success: true };
    },

    async addVoltzPoolLedger(poolId, payload = {}) {
      const db = getLocalDb();
      const pool = db.voltzPools.find(p => p.id === poolId);
      if(!pool) throw new Error('Pool não encontrada.');
      const amount = Number(payload.amount || payload.value || 0);
      const type = String(payload.type || 'CREDIT').toUpperCase();
      const userId = payload.userId;

      if(!pool.ledger) pool.ledger = [];
      pool.ledger.unshift({
        id: `TX-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        userId: userId || 'ADMIN',
        method: 'Ajuste',
        type: type,
        amount: amount,
        description: payload.description || 'Lançamento manual de saldo',
        createdAt: new Date().toISOString()
      });

      if(userId) {
        const client = pool.clients?.find(c => c.userId === userId);
        if(client) {
          const currentBal = Number(client.poolBalance || 0);
          client.poolBalance = type === 'CREDIT' ? currentBal + amount : currentBal - amount;
        }
      }

      const currentTotal = Number(pool.balance || pool.totalBalance || 0);
      pool.balance = type === 'CREDIT' ? currentTotal + amount : currentTotal - amount;
      pool.totalBalance = pool.balance;

      saveLocalDb(db);
      return pool;
    },

    async chargeVoltzPoolMonthly(poolId, payload = {}) {
      const db = getLocalDb();
      const pool = db.voltzPools.find(p => p.id === poolId);
      if(!pool) throw new Error('Pool não encontrada.');

      const fee = Number(pool.monthlyMaintenanceFee || 0);
      if(fee > 0 && pool.clients) {
        pool.clients.forEach(c => {
          if(c.status === 'ACTIVE') {
            c.poolBalance = Number(c.poolBalance || 0) - fee;
            if(!pool.ledger) pool.ledger = [];
            pool.ledger.unshift({
              id: `TX-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
              userId: c.userId,
              method: 'Tarifa',
              type: 'DEBIT',
              amount: fee,
              description: 'Manutenção Mensal do Bolsão',
              createdAt: new Date().toISOString()
            });
          }
        });
      }
      saveLocalDb(db);
      return { success: true };
    },

    async applyVoltzPoolTransactionFee(poolId, payload = {}) {
      return { success: true };
    },

    async getClientes() {
      const db = getLocalDb();
      return db.users;
    },

    async getExtrato() {
      const db = getLocalDb();
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const activeAccount = localStorage.getItem('activeAccount') || 'zait';
      return db.ledgers[currentUser?.id]?.[activeAccount]?.transactions || [];
    }
  };
})();
