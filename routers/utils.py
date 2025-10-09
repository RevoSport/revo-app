# FILE: RevoSportAPP/routers/utils.py
from colorama import Fore, Style, init as colorama_init
colorama_init(autoreset=True)

def ok(msg: str) -> None:
    print(Fore.GREEN + "✅ " + Style.RESET_ALL + msg)

def warn(msg: str) -> None:
    print(Fore.YELLOW + "⚠️  " + Style.RESET_ALL + msg)

def err(msg: str) -> None:
    print(Fore.RED + "❌ " + Style.RESET_ALL + msg)
