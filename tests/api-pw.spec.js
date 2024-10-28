import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

test.describe.only("API challenge", () => {
  let URL = "https://apichallenges.herokuapp.com/";
  let token;
  let payload;
  let database;
  let xAuthToken;
  let todo = {
    "title": faker.string.alpha(50),
    "doneStatus": true,
    "description": faker.string.alpha(200), //npx playwright test --workers 1
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

  test("02 Получить список заданий get /challenges @GET", async ({
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

  test("03 Получить статус 200 GET /todos @GET", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });
    
    let headers = await response.headers();
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("04 Получить статус 404 GET /todo @GET", async ({ request }) => {
    let response = await request.get(`${URL}todo`, {
      headers: {
        "x-challenger": token,
      },
    });
    
    let headers = await response.headers();
    expect(response.status()).toBe(404);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("05 Получить статус 200 GET /todos/{id} @GET", async ({ request }) => {
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

  test("06 Получить статус 404 GET /todos/{id} @GET", async ({ request }) => {
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

  test("08 Получить статус 200 HEAD /todos/(200) @HEAD", async ({ request }) => {

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

  test("10 Получить статус 400 post /todos/(400) @POST", async ({ request }) => {
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

  test("11 Получить статус 400 post /todos/(400) @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "Accept": "*/*",
      },
    data: {
      "title": faker.lorem.text(80),
      "doneStatus": true,
      "description": faker.lorem.text(199)
    }
    });

    let headers = response.headers();
    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("12 Получить статус 400 post /todos/(400) @POST", async ({ request }) => {

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    data: {
      "title": "mY title number 2",
      "doneStatus": true,
      "description": faker.lorem.text(201),
    }
    });

    let headers = response.headers();
    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

test("13 Создать новое задание POST /todos @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
        headers: {
            "x-challenger": token,
            //"Content-Type": "application/json",
        },
        data: todo,
    });
//console.log(await response.json());
//console.log(await response.allHeaders());
//console.log(response.headersArray());
//console.log(todo);
    expect(response.status()).toBe(201);
});

test("14 Создать новое задание POST (413) /todos @POST", async ({ request }) => {
  let response = await request.post(`${URL}todos`, {
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

test("15 Создать новое задание POST (400) /todos @POST", async ({ request }) => {
  let response = await request.post(`${URL}todos`, {
      headers: {
          "x-challenger": token,
      },
      data: {
      "title": "my title",
      "priority": "rob",
      "description": "my description",
      },
  });
  expect(response.status()).toBe(400);
});

test("16 PUT /todos/{id} (400) @PUT", async ({ request }) => {
  let id = 34;
  let response = await request.put(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: todo,
  });
  expect(response.status()).toBe(400);
});

test("17 POST /todos/{id} (200) @POST", async ({ request }) => {
  let id = 2;
  let response = await request.post(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("18 POST /todos/{id} (404) @POST", async ({ request }) => {
  let id = 35;
  let response = await request.post(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: todo,
  });
  expect(response.status()).toBe(404);
});

test("19 PUT /todos/{id} full (200) @PUT", async ({ request }) => {
  let id = 3;
  let response = await request.put(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("20 PUT /todos/{id} partial (200) @PUT", async ({ request }) => {
  let id = 4;
  let response = await request.put(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: {
        "title": "your title",
        },
  });
  expect(response.status()).toBe(200);
});

test("21 PUT /todos/{id} no title (400) @PUT", async ({ request }) => {
  let id = 4;
  let response = await request.put(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: {
        "doneStatus": true,
        "description": faker.string.alpha(55)
        },
  });
  expect(response.status()).toBe(400);
});

test("22 PUT /todos/{id} no amend id (400) @PUT", async ({ request }) => {
  let id = 4;
  let response = await request.put(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: {
        "id": 6,
        "title": faker.string.alpha(17),
        "doneStatus": true,
        "description": faker.string.alpha(55)
      },
  });
  expect(response.status()).toBe(400);
});

test("23 DELETE /todos/{id} (200) @DELETE", async ({ request }) => {
  let id = 4;
  let response = await request.delete(`${URL}todos/${id}`, {
      headers: {
          "x-challenger": token,
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("25 GET /todos/{id} (200) xml @GET", async ({ request }) => {
  let response = await request.get(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "application/xml",
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("26 GET /todos/{id} json (200) @GET", async ({ request }) => {
  let response = await request.get(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "application/json",
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("27 GET /todos/{id} any (200) @GET", async ({ request }) => {
  let response = await request.get(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "*/*",
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("28 GET /todos (200) XML pref @GET", async ({ request }) => {
  let response = await request.get(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "application/xml, application/json",
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("29 GET /todos (200) no accept @GET", async ({ request }) => {
  let response = await request.get(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "",
      },
      data: todo,
  });
  expect(response.status()).toBe(200);
});

test("30 GET /todos (406) @GET", async ({ request }) => {
  let response = await request.get(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "application/gzip",
      },
      data: todo,
  });
  expect(response.status()).toBe(406);
});

test("31 POST /todos XML @POST", async ({ request }) => {
  const twoTodo = `<?xml version="1.0" encoding="UTF-8" ?> 
        <doneStatus>true</doneStatus>
|     <title>file paperwork today</title>`;
  let response = await request.post(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "application/xml",
          "Content-Type": "application/xml",
      },
      data: twoTodo,
  });
  expect(response.status()).toBe(201);
});

test("32 POST /todos JSON @POST", async ({ request }) => {
  let response = await request.post(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "application/json",
      },
      data: todo,
  });
  expect(response.status()).toBe(201);
});

test("33 POST /todos (415) @POST", async ({ request }) => {
  let response = await request.post(`${URL}todos`, {
      headers: {
          "x-challenger": token,
          "Accept": "*/*",
          "Content-Type": "bob",
      },
      data: todo,
  });
  expect(response.status()).toBe(415);
});

test("34 GET /challenger/guid (existing X-CHALLENGER) @GET", async ({ request }) => {
  let response = await request.get(`${URL}challenger/${token}`, {
    headers: {
      "x-challenger": token,
    }
  });

  let headers = response.headers();
  
  payload = await response.json();

  expect(response.status()).toBe(200);
  expect(headers["x-challenger"]).toEqual(token);
});

test("35 PUT /challenger/guid RESTORE @PUT", async ({ request }) => {
  let response = await request.put(`${URL}challenger/${token}`, {
      headers: {
          "x-challenger": token,
      },
      data: payload,
  });
  expect(response.status()).toBe(200);
});

test("36 PUT /challenger/guid CREATE @PUT", async ({ request }) => {
    await request.put(`${URL}challenger/${token}`, {
      headers: {
        "x-challenger": token,
      },
      data: {}
    });

    let response = await request.put(`${URL}challenger/${token}`, {
      headers: {
        "x-challenger": token,
      },
      data: payload
    });

    expect(response.status()).toBe(200);
  });

  test("37 GET /challenger/database/guid (200) @GET", async ({ request }) => {
    let response = await request.get(`${URL}challenger/database/${token}`, {
      headers: {
        "x-challenger": token,
      }
    });

    database = await response.json();

    expect(response.status()).toBe(200);
  });

  test("38 	PUT /challenger/database/guid (Update) @PUT", async ({ request }) => {
    let response = await request.put(`${URL}challenger/database/${token}`, {
      headers: {
        "x-challenger": token,
      },
      data: database
    });

    expect(response.status()).toBe(204);
  });

  test("39 POST /todos XML to JSON @POST", async ({ request }) => {
    const threeTodo = `<?xml version="1.0" encoding="UTF-8" ?> 
          <doneStatus>true</doneStatus>
  |     <title>file paperwork today</title>`;
    let response = await request.post(`${URL}todos`, {
        headers: {
            "x-challenger": token,
            "Accept": "application/json",
            "Content-Type": "application/xml",
        },
        data: threeTodo,
    });
    expect(response.status()).toBe(201);
  });

  test("40 POST /todos JSON to XML @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
        headers: {
            "x-challenger": token,
            "Accept": "application/xml",
            "Content-Type": "application/json",
        },
        data: todo,
    });
    expect(response.status()).toBe(201);
  });

  test("41 DELETE /heartbeat (405) @DELETE", async ({ request }) => {

    let response = await request.delete(`${URL}heartbeat`, {
        headers: {
            "x-challenger": token,
        },
    });
    expect(response.status()).toBe(405); 
  });

  test("42 PATCH /heartbeat (500) @PATCH", async ({ request }) => {

    let response = await request.patch(`${URL}heartbeat`, {
        headers: {
            "x-challenger": token,
        },
    });
    expect(response.status()).toBe(500); 
  });

  test("44 GET /heartbeat (204) @GET", async ({ request }) => {

    let response = await request.get(`${URL}heartbeat`, {
        headers: {
            "x-challenger": token,
        },
    });
    expect(response.status()).toBe(204); 
  });

  test("45 POST /heartbeat as DELETE (405) @POST", async ({ request }) => {
    let response = await request.post(`${URL}heartbeat`, {
        headers: {
            "x-challenger": token,
            "X-HTTP-Method-Override": "DELETE",
        },
        data: todo,
    });
    expect(response.status()).toBe(405);
  });

  test("46 	POST /heartbeat as PATCH (500) @POST", async ({ request }) => {
    let response = await request.post(`${URL}heartbeat`, {
        headers: {
            "x-challenger": token,
            "X-HTTP-Method-Override": "PATCH",
        },
        data: todo,
    });
    expect(response.status()).toBe(500);
  });

  test("47 	POST /heartbeat as Trace (501) @POST", async ({ request }) => {
    let response = await request.post(`${URL}heartbeat`, {
        headers: {
            "x-challenger": token,
            "X-HTTP-Method-Override": "Trace",
        },
        data: todo,
    });
    expect(response.status()).toBe(501);
  });

  test("48 POST /secret/token (401) @POST", async ({ request }) => {
    
    let response = await request.post(`${URL}secret/token`, {
      headers: {
        "x-challenger": token,
        "Authorization": "Basic YWRtaW46cGFzc3dvcmRk",
      },
    });

  
    expect(response.status()).toBe(401);
  });

  test("49 POST /secret/token (201) @POST", async ({ request }) => {
    
    let response = await request.post(`${URL}secret/token`, {
      headers: {
        "x-challenger": token,
        "Authorization": "Basic YWRtaW46cGFzc3dvcmQ=",
      },
    });
    let headers = response.headers();
    xAuthToken = headers["x-auth-token"];
    expect(response.status()).toBe(201);
   });

    test("50 GET /secret/note (403) @GET", async ({ request }) => {

      let response = await request.get(`${URL}secret/note`, {
          headers: {
              "x-challenger": token,
              "X-AUTH-TOKEN": 'bob',
          },
      });
      expect(response.status()).toBe(403); 
    });
    
    test("51 GET /secret/note (401) @GET", async ({ request }) => {

      let response = await request.get(`${URL}secret/note `, {
          headers: {
              "x-challenger": token,
          },
      });
      expect(response.status()).toBe(401); 
    });

    test("52 GET /secret/note (200) @GET", async ({ request }) => {

      let response = await request.get(`${URL}secret/note`, {
          headers: {
              "x-challenger": token,
              "X-AUTH-TOKEN": xAuthToken,
          },
      });
      expect(response.status()).toBe(200); 
    });

    test("53 POST /secret/note (200) @POST", async ({ request }) => {
      let note = { "note": "my note is here" }
      let response = await request.post(`${URL}secret/note`, {
        headers: {
          "x-challenger": token,
          "X-AUTH-TOKEN": xAuthToken,
        },
        data: note,
      });
      expect(response.status()).toBe(200);
     });

     test("54 POST /secret/note (401) @POST", async ({ request }) => {
      let note = { "note": "my note is here" }
      let response = await request.post(`${URL}secret/note`, {
        headers: {
          "x-challenger": token,
        },
        data: note,
      });
      expect(response.status()).toBe(401);
     });

     test("55 POST /secret/note (403) @POST", async ({ request }) => {
      let note = { "note": "my note is here" }
      let response = await request.post(`${URL}secret/note`, {
        headers: {
          "x-challenger": token,
          "X-AUTH-TOKEN": "bob",
        },
        data: note,
      });
      expect(response.status()).toBe(403);
     });

     test("56 GET /secret/note (Bearer) @GET", async ({ request }) => {
      let note = { "note": "my note is here" }
      let response = await request.get(`${URL}secret/note`, {
          headers: {
              "x-challenger": token,
              "Authorization": `Bearer ${xAuthToken}`,
          },
          data: note,
      });
      expect(response.status()).toBe(200); 
    });

    test("57 POST /secret/note (Bearer) @POST", async ({ request }) => {
      let note = { "note": "my note is here" }
      let response = await request.post(`${URL}secret/note`, {
        headers: {
          "x-challenger": token,
          "Authorization": `Bearer ${xAuthToken}`,
        },
        data: note,
      });
      expect(response.status()).toBe(200);
     });

     test("58 DELETE /todos/{id} (200) all @DELETE", async ({ request }) => {
      let responseTodos = await request.get(`${URL}todos`, {
        headers: {
          "x-challenger": token,
        },
      });
  
      let idNumber = (await responseTodos.json())['todos']
  
      for (let index = 0; index < idNumber.length; index++) {
        let response = await request.delete(`${URL}todos/${idNumber[index]['id']}`, {
          headers: {
            "x-challenger": token
          }
        });
        let headers = response.headers();
  
        expect(response.status()).toBe(200);
        expect(headers["x-challenger"]).toEqual(token);
  
      }
    });
  
    test("59 POST /todos (201) all @POST", async ({ request }) => {
  
      for (let index = 0; index < 20; index++) {
        let response = await request.post(`${URL}todos`, {
          headers: {
            "x-challenger": token
          },
          data: todo
        });
        let headers = response.headers();
  
        expect(response.status()).toBe(201);
        expect(headers["x-challenger"]).toEqual(token);
  
      }
  
      let response = await request.post(`${URL}todos`, {
        headers: {
          "x-challenger": token
        },
        data: todo
      });
      let headers = response.headers();
  
      expect(response.status()).toBe(400);
      expect(headers["x-challenger"]).toEqual(token);
    });

});
