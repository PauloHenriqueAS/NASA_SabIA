# SabIA - API

<p align="center">
<img src="https://img.shields.io/badge/STATUS-EM DESENVOLVIMENTO-green"/>
</p>


## ⚙️ Tecnologias Utilizadas

<div align="center">
    <div style="display: inline_block"><br>
        <img align="center" alt="FastAPI" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg">
         <img align="center" alt="Json" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/json/json-original.svg">
          <img align="center" alt="Swagger" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swagger/swagger-original.svg">
    </div>
</div>

## 🗒️ API Description
The API has two endpoints:

/GetAllDataInfo

/GetDataLocation

The first one returns all meteorological information from the API, while the second allows you to search by date and location.

## 🌐 Website

The project was built using the [FastApi](https://fastapi.tiangolo.com/).

## 🖥️ Running the Application in Development Mode

- Clone the repository and navigate to the back-end folder.

- Install the required libraries:
```
pip install -r .\requirements.txt
```

- To run the application in development mode, use the command:

```
uvicorn main:app --reload
```
This command compiles and runs the application. Then, open the link generated in the terminal, e.g., http://127.0.0.1:8000.
The app will automatically reload whenever code changes are made to any file.

<hr> 

</div>
