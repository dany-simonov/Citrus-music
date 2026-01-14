/**
 * Политика конфиденциальности
 * @module app/privacy/page
 */

'use client';

import { MainLayout } from '@/components/layout';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="py-4 md:py-8 pb-32 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/account" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад в аккаунт
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Политика конфиденциальности</h1>
              <p className="text-gray-500">Citrus Music • Последнее обновление: 1 января 2026 г.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-neutral-800 prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Общие положения</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки 
              и защиты персональных данных пользователей сервиса Citrus Music (далее — «Сервис»), 
              разработанного командой Citrus Team (далее — «Мы», «Нас», «Наш»).
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Используя Сервис, вы подтверждаете, что ознакомились с данной Политикой и согласны 
              с условиями обработки ваших персональных данных.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. Какие данные мы собираем</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              При использовании Сервиса мы можем собирать следующие категории данных:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <strong>Данные авторизации:</strong> токены доступа к сторонним сервисам 
                (ВКонтакте, Яндекс Музыка), необходимые для работы функций воспроизведения музыки.
              </li>
              <li>
                <strong>Данные профиля:</strong> имя пользователя, аватар и идентификатор из 
                подключённых сервисов.
              </li>
              <li>
                <strong>История прослушивания:</strong> информация о прослушанных треках для 
                формирования рекомендаций и истории.
              </li>
              <li>
                <strong>Избранное и плейлисты:</strong> данные о добавленных в избранное треках 
                и созданных плейлистах.
              </li>
              <li>
                <strong>Технические данные:</strong> информация о браузере, устройстве и 
                операционной системе для улучшения работы Сервиса.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. Как мы используем данные</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Собранные данные используются исключительно для:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Обеспечения работы функций воспроизведения музыки</li>
              <li>Персонализации пользовательского опыта</li>
              <li>Формирования рекомендаций на основе истории прослушивания</li>
              <li>Сохранения пользовательских настроек и предпочтений</li>
              <li>Улучшения качества и стабильности работы Сервиса</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Хранение данных</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Все данные хранятся локально на вашем устройстве с использованием технологии 
              localStorage браузера. Токены доступа к сторонним сервисам не передаются на 
              наши серверы и используются исключительно для авторизации запросов к 
              соответствующим API.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Мы не храним ваши данные на внешних серверах и не передаём их третьим лицам, 
              за исключением случаев, предусмотренных законодательством Российской Федерации.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Интеграция со сторонними сервисами</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Сервис интегрируется с платформами ВКонтакте и Яндекс Музыка. При авторизации 
              через эти сервисы применяются их собственные политики конфиденциальности:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
              <li>
                <a 
                  href="https://vk.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:underline"
                >
                  Политика конфиденциальности ВКонтакте
                </a>
              </li>
              <li>
                <a 
                  href="https://yandex.ru/legal/confidential/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:underline"
                >
                  Политика конфиденциальности Яндекса
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">6. Ваши права</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              В соответствии с законодательством о защите персональных данных вы имеете право:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Получить информацию об обрабатываемых персональных данных</li>
              <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>Удалить все данные, очистив локальное хранилище браузера</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">7. Безопасность</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Мы принимаем необходимые технические и организационные меры для защиты 
              персональных данных от несанкционированного доступа, изменения, раскрытия 
              или уничтожения. Все соединения с внешними сервисами осуществляются по 
              защищённому протоколу HTTPS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">8. Изменения политики</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Мы оставляем за собой право вносить изменения в настоящую Политику. 
              Актуальная версия всегда доступна на данной странице. Продолжение 
              использования Сервиса после внесения изменений означает ваше согласие 
              с обновлённой Политикой.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">9. Контактная информация</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              По всем вопросам, связанным с обработкой персональных данных, вы можете 
              обратиться к нам по электронной почте:{' '}
              <a 
                href="mailto:citrus.helper.team@gmail.com" 
                className="text-orange-500 hover:underline"
              >
                citrus.helper.team@gmail.com
              </a>
            </p>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-500 text-center">
              © 2025–2026 Citrus Team. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
