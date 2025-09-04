--- 
title: Prueba
os: Linux 
dificultad: Dificil 
img: Code_logo.png 
skills:
  - Web Enumeration
  - Python Jail
  - Python Reverse Shell Restriction Bypass
  - Database SQLite File Enumeration
  - Cracking Hashes
  - SQL Injection SQLI
plataforma: Hackthebox 
description: Máquina facil para prácticar técnicas de bypass en python.
--- 

### ⚠️Descripción

Code es una máquina Linux sencilla que cuenta con una aplicación web Python Code Editor vulnerable a la ejecución remota de código mediante un bypass de Python Jail. Después de obtener acceso como usuario de producción de la aplicación, se pueden encontrar credenciales descifrables en un archivo de base de datos sqlite3. Con estas credenciales, se obtiene acceso a otro usuario, martin , que tiene permisos sudo para un script de utilidad de respaldo, backy.sh . Este script incluye una sección de código vulnerable que, cuando se explota, nos permite escalar nuestros privilegios creando una copia de la carpeta raı́z.

### Objetivos

#### Objetivo general

Desarrollar habilidades de análisis y explotación en entornos restringidos de ejecución de código en Python (Python Jail), con el fin de fortalecer el conocimiento sobre vulnerabilidades, evasión de filtros y seguridad en aplicaciones que ejecutan código dinámico.. Como es el caso de la Máquina Code. 

#### Objetivos Especificos

- Comprender el funcionamiento interno del lenguaje Python, incluyendo introspección, objetos y estructuras dinámicas como builtins , getattr, eval y exec. 
- Identificar y evadir mecanismos de restricción artificial (filtros, listas negras, entornos limitados) impuestos en un entorno tipo jail. 
- Aplicar técnicas ofensivas de bypass, como reconstrucción de funciones prohibidas, manipulación de clases y uso de expresiones indirectas para ejecutar código arbitrario. 
- Evaluar los riesgos de seguridad asociados con la ejecución de código Python no controlado, como el uso inseguro de eval, input o exec en aplicaciones web o automatizadas.<br>  


### Analisis de Vulnerabilidades

#### Reconocimiento Inicial

Se comenzó realizando un análisis inicial sobre el sistema, cuyo objetivo principal fue comprobar la disponibilidad y accesibilidad del equipo o servicio objetivo desde el segmento de red en el que se estaba operando. Esta verificación resultó fundamental para asegurar que la comunicación entre el host atacante y el sistema de destino fuera posible antes de iniciar fases más avanzadas de la evaluación. Para llevar a cabo esta tarea de reconocimiento preliminar, se emplearon herramientas de terminal ampliamente utilizadas en auditorı́as de seguridad:

**Ping**, para enviar solicitudes ICMP al host y confirmar su capacidad de respuesta, además de obtener información básica como ser el tipo de sistema operativo ya sea Windows o Linux mediante el **TTL**.

![Ejecución del comando ping](../../../code/ping.png)

**Nmap**, para efectuar un escaneo de puertos y servicios disponibles, identificando posibles puntos de entrada o servicios expuestos que pudieran ser analizados en etapas posteriores.

![Ejecución del comando ping](../../../code/nmap.png)

Este proceso inicial permitió obtener una visión general del estado de la red y del sistema objetivo, sirviendo como base para definir la estrategia y priorizar las acciones en las siguientes fases de la evaluación.

