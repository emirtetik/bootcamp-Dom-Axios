const dataButton = document.getElementById("btn-data");
const tableBody = document.getElementById("tableBody");
const priceSelect = document.getElementById("priceSelect");
const loading = document.getElementById("loading");

//    Instance
const axiosintance = axios.create({
  baseURL: "https://northwind.vercel.app/api",
  timeout: 2000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

//  Interceptor Data Gelmeden Önce
axiosintance.interceptors.request.use(
  function (config) {
    console.log("Data geliyor ondan önce bir şey yapmak ister misin?");
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
//  veriyi boş bir değişkende tutuyoruz çünkü her options da veriyi tekrar tekrar çekmemek için 
let storedData = null;
const fetchData = async () => {
  // loading
  loading.style.display = "block";

  //   AbortController Fetch
  //   const abortControl = new AbortController();
  //   const { signal } = abortControl;

  // Axios Için AbortController
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  //    Veri çekmek
  let data;
  try {
    if (!storedData) {
      const response = await axiosintance.get("/products", {
        cancelToken: source.token,
      });

      //   fetch işlemnini siteden ayrılınca bu süre sonra iptal et
      setTimeout(() => {
        source.cancel("zaman aşımı nedeniyle iptal oldu");
      }, 5000);
      //   storedData
      storedData = response.data;
    }

    data = storedData;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("fetch Aborted");
    } else {
      console.error("Failed", error);
    }
    loading.style.display = "none";
    return;
  }

  // filtrele
  const selectFilter = priceSelect.value;
  if (selectFilter !== "All") {
    data = data.filter((product) => product.unitPrice <= selectFilter);
  }

  // önceki verileri temizle
  tableBody.innerHTML = "";

  // veriyi tabloya yazdır
  data.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${product.id}</td> 
                <td>${product.name}</td>
                <td>${product.unitPrice}</td>
                <td>${product.unitsInStock}</td>
                <td><button class="delete-btn">Delete</button></td>
            `;

    // Delete işlemi
    const deleteButton = row.querySelector(".delete-btn");

    deleteButton.addEventListener("click", async () => {
      try {
        await axiosintance.delete(`/products/${product.id}`);

        row.remove();
      } catch (error) {
        console.error("Failed", error);
        alert("Silme işlemi başarısız oldu.");
      }
    });

    tableBody.appendChild(row);
  });

  loading.style.display = "none";
};

//  Interceptor Data Geldikten Sonra
axiosintance.interceptors.response.use(
  (response) => {
    console.log("Data geldi peki şimdi ne yapıcaksın?");
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

dataButton.addEventListener("click", fetchData);
priceSelect.addEventListener("change", fetchData);
