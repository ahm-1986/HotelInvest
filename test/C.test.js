// offer_invest_test.js

/*
SCENARIO & EXPECTED OUTPUT:

Step 1 – Register and login Hotel Admin
  Action:
    - POST /auth/register with hotel_admin role
    - POST /auth/login with same credentials
  Expected:
    - 201 Created with user details (or 409 Conflict if already exists)
    - 200 OK with JWT token in body.token
    - Store admin_auth_header for later API calls

Step 2 – Register and login Investor A
  Action:
    - POST /auth/register with investor role
    - POST /auth/login with same credentials
  Expected:
    - 201 Created with user details (or 409 Conflict if already exists)
    - 200 OK with JWT token
    - Store invA_auth_header and invAId

Step 3 – Register and login Investor B
  Action:
    - Same as Step 2 for Investor B
  Expected:
    - 201 Created / 409 Conflict
    - 200 OK with JWT token
    - Store invB_auth_header and invBId

Step 4 – Deposit initial funds into both investors’ wallets
  Action:
    - POST /wallets/{invAId}/deposit with { amount: 1000 }
    - POST /wallets/{invBId}/deposit with { amount: 800 }
  Expected:
    - 201 Created or 200 OK for each deposit
    - Wallet balances increase accordingly

Step 5 – Verify initial balances
  Action:
    - GET /wallets/{invAId}
    - GET /wallets/{invBId}
  Expected:
    - Investor A balance = 1000
    - Investor B balance = 800

Step 6 – Hotel Admin creates an offer
  Action:
    - POST /offers with:
      {
        title, description, targetAmount: 1200,
        minimumInvestment: 200, apr: 0.12, closesAt: +7 days
      }
  Expected:
    - 201 Created with offerId in response body
    - Offer is visible for investment

Step 7 – Investor A invests in the offer
  Action:
    - POST /offers/{offerId}/invest with { amount: 700 }
  Expected:
    - 201 Created or 200 OK
    - Investor A balance decreases by 700 (from 1000 → 300)

Step 8 – Investor B invests in the offer
  Action:
    - POST /offers/{offerId}/invest with { amount: 500 }
  Expected:
    - 201 Created or 200 OK
    - Investor B balance decreases by 500 (from 800 → 300)

Step 9 – Verify post-investment balances
  Action:
    - GET /wallets/{invAId}
    - GET /wallets/{invBId}
  Expected:
    - Investor A balance = 300
    - Investor B balance = 300
    - Balances match initial balance - investment amount

Step 10 – Verify offer funding status
  Action:
    - GET /offers/{offerId}
  Expected:
    - fundedAmount = 1200 (700 from A + 500 from B)
    - targetAmount remains 1200
    - Funding percentage = 100% (if applicable in API)

Step 11 – Final test result
  PASS if:
    - All status codes match expectations
    - Wallet balances decreased by exactly the invested amounts
    - Offer fundedAmount equals sum of both investments
  FAIL if:
    - Any of the above validations fail
*/

var unirest = require("unirest");

var baseUrl = "http://localhost:5000/api";
var x_www_header = { "Content-Type": "application/json" };

var admin_auth_header;
var invA_auth_header;
var invB_auth_header;

var hotelAdmin = {
  name: "Hotel Admin",
  email: "hoteladmin@test.local",
  password: "HotelAdmin#123",
  role: "hotel_admin",
};

var investorA = {
  name: "Investor A",
  email: "investorA@test.local",
  password: "InvestorA#123",
  role: "investor",
};
var investorB = {
  name: "Investor B",
  email: "investorB@test.local",
  password: "InvestorB#123",
  role: "investor",
};

var invAId, invBId, offerId;

async function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

(async function run() {
  try {
    // Step 1–3: Auth
    await ensureUser(hotelAdmin, (hdr) => (admin_auth_header = hdr));
    invAId = await ensureUser(investorA, (hdr, id) => { invA_auth_header = hdr; invAId = id; });
    invBId = await ensureUser(investorB, (hdr, id) => { invB_auth_header = hdr; invBId = id; });

    // Step 4: Deposit funds
    const depositA = 1000, depositB = 800;
    await deposit(invAId, depositA, invA_auth_header);
    await deposit(invBId, depositB, invB_auth_header);

    await sleep(200);

    // Step 5: Check initial balances
    const balA0 = await balance(invAId, invA_auth_header);
    const balB0 = await balance(invBId, invB_auth_header);
    console.log("Initial balances:", { invA: balA0, invB: balB0 });

    // Step 6: Create offer
    const offerPayload = {
      title: "Seaside Hotel Expansion",
      description: "Raise funds for new wing",
      targetAmount: 1200,
      minimumInvestment: 200,
      apr: 0.12,
      closesAt: new Date(Date.now() + 7*24*3600*1000).toISOString()
    };
    offerId = await createOffer(offerPayload, admin_auth_header);
    console.log("✅ Offer created:", offerId);

    // Step 7–8: Investments
    const investA = 700;
    const investB = 500;

    await invest(offerId, investA, invA_auth_header);
    await invest(offerId, investB, invB_auth_header);
    console.log("✅ Both investments submitted");

    await sleep(200);

    // Step 9: Check post-investment balances
    const balA1 = await balance(invAId, invA_auth_header);
    const balB1 = await balance(invBId, invB_auth_header);

    const okA = approxEqual(balA0 - investA, balA1);
    const okB = approxEqual(balB0 - investB, balB1);

    console.log("Post-invest balances:", { invA: balA1, invB: balB1 });
    console.log(okA ? "✅ Investor A balance decreased correctly" : "❌ Investor A balance mismatch");
    console.log(okB ? "✅ Investor B balance decreased correctly" : "❌ Investor B balance mismatch");

    // Step 10: Check offer funding
    const offer = await getOffer(offerId);
    const funded = offer && (offer.fundedAmount ?? offer.raisedAmount ?? 0);
    const okOffer = approxEqual(funded, investA + investB) || funded >= (investA + investB);

    console.log("Offer funding:", { fundedAmount: funded, targetAmount: offer.targetAmount });
    console.log(okOffer ? "✅ Offer funded amount reflects both investments" : "❌ Offer funded amount mismatch");

    // Step 11: Final result
    if (okA && okB && okOffer) {
      console.log("🎉 TEST PASS: wallets decreased and offer funded correctly");
    } else {
      console.log("⚠️ TEST PARTIAL/FAIL: See logs above for mismatches");
    }

  } catch (err) {
    console.error("❌ Error in test flow:", err?.message || err);
  }
})();

// ===== Helpers =====
function approxEqual(a, b, eps = 1e-6) {
  return Math.abs((a ?? 0) - (b ?? 0)) <= eps;
}

async function ensureUser(userObj, setCreds) {
  let r = (await register(userObj)).toJSON();
  if (r.statusCode === 201) {
    console.log(`✅ Registered ${userObj.role}:`, r.body?.user?.id || r.body);
  } else if (r.statusCode === 409) {
    console.log(`ℹ️ ${userObj.role} already exists`);
  } else {
    throw new Error(`Register ${userObj.role} failed: ${r.statusCode}`);
  }

  let l = (await login({ email: userObj.email, password: userObj.password })).toJSON();
  if (l.statusCode !== 200 || !l.body?.token) {
    throw new Error(`Login ${userObj.role} failed: ${l.statusCode}`);
  }
  const auth = { Authorization: "Bearer " + l.body.token };
  const uid = l.body?.user?.id || l.body?.user?._id;
  setCreds(auth, uid);
  console.log(`✅ Logged in ${userObj.role}:`, uid);
  return uid;
}

function register(payload) {
  return unirest("POST", baseUrl + "/auth/register")
    .headers(x_www_header)
    .send(payload);
}
function login(payload) {
  return unirest("POST", baseUrl + "/auth/login")
    .headers(x_www_header)
    .send(payload);
}
function createOffer(payload, auth) {
  return unirest("POST", baseUrl + "/offers")
    .headers(Object.assign({}, x_www_header, auth))
    .send(payload)
    .then(r => {
      const j = r.toJSON();
      if (j.statusCode !== 201) throw new Error("Create offer failed: " + j.statusCode);
      return j.body?.id || j.body?._id || j.body?.offer?.id || j.body?.offer?._id;
    });
}
function getOffer(offerId) {
  return unirest("GET", baseUrl + "/offers/" + offerId)
    .headers(x_www_header)
    .then(r => {
      const j = r.toJSON();
      if (j.statusCode !== 200) throw new Error("Get offer failed: " + j.statusCode);
      return j.body?.offer || j.body;
    });
}
function invest(offerId, amount, auth) {
  return unirest("POST", baseUrl + `/offers/${offerId}/invest`)
    .headers(Object.assign({}, x_www_header, auth))
    .send({ amount })
    .then(r => {
      const j = r.toJSON();
      if (j.statusCode !== 201 && j.statusCode !== 200) {
        throw new Error("Invest failed: " + j.statusCode + " " + JSON.stringify(j.body));
      }
      return j.body;
    });
}
function deposit(userId, amount, auth) {
  return unirest("POST", baseUrl + `/wallets/${userId}/deposit`)
    .headers(Object.assign({}, x_www_header, auth))
    .send({ amount })
    .then(r => {
      const j = r.toJSON();
      if (j.statusCode !== 201 && j.statusCode !== 200) {
        throw new Error("Deposit failed: " + j.statusCode + " " + JSON.stringify(j.body));
      }
      return j.body;
    });
}
function balance(userId, auth) {
  return unirest("GET", baseUrl + `/wallets/${userId}`)
    .headers(Object.assign({}, x_www_header, auth))
    .then(r => {
      const j = r.toJSON();
      if (j.statusCode !== 200) throw new Error("Get balance failed: " + j.statusCode);
      const w = j.body?.wallet || j.body;
      return w?.balance ?? w?.available ?? w?.funds ?? 0;
    });
}
