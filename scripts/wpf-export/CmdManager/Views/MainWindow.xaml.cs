using System.Windows;
using System.Windows.Controls;
using CmdManager.Data;
using CmdManager.ViewModels;

namespace CmdManager.Views
{
    public partial class MainWindow : Window
    {
        public static AppViewModel VM { get; private set; } = null!;

        public MainWindow()
        {
            InitializeComponent();
            VM = new AppViewModel(Store.Load());
            NavigateTo("commands");
        }

        private void NavigateTo(string page)
        {
            SetActiveNav(page);
            switch (page)
            {
                case "commands":  ContentFrame.Navigate(new CommandsPage());  break;
                case "chains":    ContentFrame.Navigate(new ChainsPage());    break;
                case "registry":  ContentFrame.Navigate(new RegistryPage());  break;
                case "groups":    ContentFrame.Navigate(new GroupsPage());     break;
            }
        }

        private void SetActiveNav(string active)
        {
            NavCommands.Style = active == "commands"  ? (Style)Resources["NavButtonActive"] ?? FindResource("NavButtonActive") as Style : FindResource("NavButton") as Style;
            NavChains.Style   = active == "chains"    ? FindResource("NavButtonActive") as Style : FindResource("NavButton") as Style;
            NavRegistry.Style = active == "registry"  ? FindResource("NavButtonActive") as Style : FindResource("NavButton") as Style;
            NavGroups.Style   = active == "groups"    ? FindResource("NavButtonActive") as Style : FindResource("NavButton") as Style;
        }

        private void NavCommands_Click(object sender, RoutedEventArgs e)  => NavigateTo("commands");
        private void NavChains_Click(object sender, RoutedEventArgs e)    => NavigateTo("chains");
        private void NavRegistry_Click(object sender, RoutedEventArgs e)  => NavigateTo("registry");
        private void NavGroups_Click(object sender, RoutedEventArgs e)    => NavigateTo("groups");

        private void ResetData_Click(object sender, RoutedEventArgs e)
        {
            var r = MessageBox.Show("Reset all data to demo defaults?", "Reset Data",
                MessageBoxButton.YesNo, MessageBoxImage.Warning);
            if (r == MessageBoxResult.Yes)
            {
                Store.Reset();
                VM = new AppViewModel(Store.Load());
                NavigateTo("commands");
            }
        }
    }
}
