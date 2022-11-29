import { FC } from "react";
import { useTranslation } from "react-i18next";
import { classNames } from "shared/lib/classNames/classNames";
import { Button } from "shared/ui/Button";
import { ThemeButton } from "shared/ui/Button/ui/Button";
import cls from "./LanguageSwitcher.module.scss";

interface ILanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: FC<ILanguageSwitcherProps> = ({ className }) => {
  const { t, i18n } = useTranslation();

  const toggle = () => {
    // вызываем функцию перевода и в ней меняем язык на противоположный
    i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru");
  };

  return (
    <Button
      theme={ThemeButton.CLEAR}
      onClick={toggle}
      className={classNames(cls.languageSwitcher, {}, [className])}
    >
      {t("Язык")}
    </Button>
  );
};