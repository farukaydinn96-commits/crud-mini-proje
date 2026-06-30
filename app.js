import axios from "https://cdn.jsdelivr.net/npm/axios@1.6.7/+esm";
axios.defaults.baseURL = "https://jsonplaceholder.typicode.com";

document.querySelector("#load-users").addEventListener("click", async () => {
  try {
    const res = await axios.get("/users");

    const markup = res.data
      .map(
        (u) =>
          `<li><strong>${u.name}</strong> - ${u.email} <em>(${u.company.name})</em></li>`,
      )
      .join("");
    document.querySelector("#user-list").innerHTML = markup;
    iziToast.success({ title: "Başarılı", message: "Kullanıcılar yüklendi!" });
  } catch (err) {
    iziToast.error({ title: "Hata", message: "Kullanıcılar alınamadı!" });
  }
});

let page = 1;
const limit = 5;

async function loadPosts() {
  try {
    const res = await axios.get("/posts", {
      params: { _limit: limit, _page: page },
    });

    const markup = res.data
      .map(
        (p) => `
      <li data-id="${p.id}" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
        <b>${p.title}</b>
        <p>${p.body}</p>
        <button class="edit-btn">Düzenle</button>
        <button class="delete-btn" style="color: red;">Sil</button>
      </li>
    `,
      )
      .join("");

    document
      .querySelector("#post-list")
      .insertAdjacentHTML("beforeend", markup);
    page++;

    if (page === 2) {
      iziToast.success({
        title: "Başarılı",
        message: "İlk gönderiler yüklendi!",
      });
    }
  } catch (err) {
    iziToast.error({ title: "Hata", message: "Gönderiler alınamadı!" });
  }
}

document.querySelector("#load-posts").addEventListener("click", loadPosts);
document.querySelector("#load-more").addEventListener("click", loadPosts);

document.querySelector("#post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const newPost = { title: form.title.value, body: form.body.value, userId: 1 };

  try {
    const res = await axios.post("/posts", newPost, {
      headers: { "Content-Type": "application/json" },
    });

    iziToast.success({
      title: "Eklendi",
      message: "Yeni gönderi başarıyla oluşturuldu!",
    });

    const markup = `
      <li data-id="${res.data.id}" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px; background: #eef;">
        <b>${res.data.title}</b>
        <p>${res.data.body}</p>
        <button class="edit-btn">Düzenle</button>
        <button class="delete-btn" style="color: red;">Sil</button>
      </li>`;
    document
      .querySelector("#post-list")
      .insertAdjacentHTML("afterbegin", markup);

    form.reset();
  } catch (err) {
    iziToast.error({ title: "Hata", message: "Gönderi eklenemedi!" });
  }
});

document.querySelector("#post-list").addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const postId = li.dataset.id;

  if (e.target.classList.contains("delete-btn")) {
    try {
      await axios.delete(`/posts/${postId}`);
      li.remove();
      iziToast.info({
        title: "Silindi",
        message: "Gönderi başarıyla kaldırıldı.",
      });
    } catch (err) {
      iziToast.error({ title: "Hata", message: "Gönderi silinemedi!" });
    }
  }

  if (e.target.classList.contains("edit-btn")) {
    const currentTitle = li.querySelector("b").textContent;
    const newTitle = prompt("Yeni başlığı girin:", currentTitle);

    if (!newTitle || newTitle === currentTitle) return;

    try {
      const res = await axios.patch(`/posts/${postId}`, { title: newTitle });
      li.querySelector("b").textContent = res.data.title;
      iziToast.success({
        title: "Güncellendi",
        message: "Başlık başarıyla değiştirildi.",
      });
    } catch (err) {
      iziToast.error({ title: "Hata", message: "Gönderi güncellenemedi!" });
    }
  }
});
