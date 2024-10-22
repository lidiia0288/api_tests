import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

test.describe.only("API challenge", () => {
  let URL = "https://apichallenges.herokuapp.com/";
  let token;
  let payload;
  let database;
  let xAuthToken;
  /*let todo = {
    "title": faker.string.alpha(50),
    "doneStatus": true,
    "description": faker.string.alpha(200) //npx playwright test --workers 1
  };*/
  let todo = {
    "title": "Белка и Стрелка и Бондюэль",
    "doneStatus": true,
    "description": "my description"
  };

  test.beforeAll(async ({ request }) => {
    // Запросить ключ авторизации
    let response = await request.post(`${URL}challenger`);
    let headers = response.headers();
    // Передаем токен в тест
    token = headers["x-challenger"];
    // Пример ассерта
    expect(headers).toEqual(
      expect.objectContaining({ "x-challenger": expect.any(String) }),
    );

    console.log(token);
  });

  test("02 Получить список заданий get /challenges @API", async ({
    request,
  }) => {
    let response = await request.get(`${URL}challenges`, {
      headers: {
        "x-challenger": token,
      },
    });
    let body = await response.json();
    let headers = await response.headers();
    console.log(body.challenges.length);
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    expect(body.challenges.length).toBe(59);
  });

  test("03 Получить статус 200 GET /todos @API", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("04 Получить статус 404 GET /todo @API", async ({ request }) => {
    let response = await request.get(`${URL}todo`, {
      headers: {
        "x-challenger": token,
      },
    });
    
    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("05 Получить статус 200 GET /todos/{id} @API", async ({ request }) => {
    let id = 3;
    let response = await request.get(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("06 Получить статус 404 GET /todos/{id} @API", async ({ request }) => {
    let id = 5555;
    let response = await request.get(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("09 Отправить запрос POST /todos (201) @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: todo
    });

    let headers = response.headers();

    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("07 Отправить запрос GET /todos (200) ?filter @GET", async ({ request }) => {

  let filter = {
      "doneStatus": true
    };

    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      params: filter,
    });

    let headers = response.headers();

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("08 Получить статус 200 HEAD /todos/(200) @API", async ({ request }) => {

    let response = await request.head(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    data: todo
    });

    let headers = response.headers();
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("10 Получить статус 400 post /todos/(400) @API", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "*/*",
      },
    data: {
      "title": "create todo process payroll",
      "doneStatus": "kompot",
      "description": "my",
       }
    });

    let headers = response.headers();
    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("11 Получить статус 400 post /todos/(400) @API", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "*/*",
      },
    data: {
      "title": faker.lorem.text(55),
      "doneStatus": true,
      "description": faker.lorem.text(90)
    }
    });

    let headers = response.headers();
    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("12 Получить статус 400 post /todos/(400) @API", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "*/*",
      },
    data: {
      "title": faker.lorem.text(20),
      "doneStatus": true,
      "description": faker.lorem.text(250)
    }
    });

    let headers = response.headers();
    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

test("13 Создать новое задание POST /todos @API", async ({ request }) => {
    let response = await request.post(`${URL}/todos`, {
        headers: {
            "x-challenger": token,
            //"Content-Type": "application/json",
        },
        data: todo,
    });
console.log(await response.json());
//console.log(await response.allHeaders());
console.log(response.headersArray());
console.log(todo);
    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
});

test("14 Создать новое задание POST (413) /todos @API", async ({ request }) => {
  let response = await request.post(`${URL}/todos`, {
      headers: {
          "x-challenger": token,
      },
      data: {
        "title": "my title",
      "doneStatus": true,
      "description": faker.string.alpha(5000),
      },
  });
  expect(response.status()).toBe(413);
});

test("15 Создать новое задание POST (400) /todos @API", async ({ request }) => {
  let response = await request.post(`${URL}/todos`, {
      headers: {
          "x-challenger": token,
      },
      data: {
      "title": "my title",
      "doneStatus": "rob",
      "description": "my description",
      },
  });
  expect(response.status()).toBe(400);
});


  test("49 Получить статус 201 GET secret/token @API", async ({ request }) => {
    
    let response = await request.post(`${URL}secret/token`, {
      headers: {
        "x-challenger": token,
        "Authorization": "Basic YWRtaW46cGFzc3dvcmQ=",
      },
    });

    let headers = await response.headers();
    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });
});
