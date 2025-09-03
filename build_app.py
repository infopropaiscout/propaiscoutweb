import PyInstaller.__main__
import os
import shutil

def build_app():
    # Clean previous builds
    if os.path.exists('dist'):
        shutil.rmtree('dist')
    if os.path.exists('build'):
        shutil.rmtree('build')

    # Frontend build command
    print("Building Frontend...")
    os.system('cd frontend && npm run build')

    # Backend build command
    print("Building Backend...")
    PyInstaller.__main__.run([
        'backend/app/main.py',
        '--name=PropAIScout',
        '--onefile',
        '--add-data=backend/app/services:services',
        '--add-data=frontend/build:frontend/build',
        '--hidden-import=uvicorn.logging',
        '--hidden-import=uvicorn.loops',
        '--hidden-import=uvicorn.loops.auto',
        '--hidden-import=uvicorn.protocols',
        '--hidden-import=uvicorn.protocols.http',
        '--hidden-import=uvicorn.protocols.http.auto',
        '--hidden-import=uvicorn.protocols.websockets',
        '--hidden-import=uvicorn.protocols.websockets.auto',
        '--hidden-import=uvicorn.lifespan',
        '--hidden-import=uvicorn.lifespan.on',
    ])

    # Copy configuration files
    shutil.copy('backend/app/.env', 'dist/.env')
    
    print("Build completed! Executable is in the dist folder.")
